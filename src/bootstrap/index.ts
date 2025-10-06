/**
 * Payment Widget Bootstrap
 * Lightweight loader script (1-3KB gzipped)
 * Lê configurações via data-* attributes e inicializa o widget
 */

import type {
  WidgetInstance as CDNWidgetInstance,
  WidgetConfig,
  WidgetState,
} from "../types";
import { logger } from "../utils/logger";

type BootstrapState = {
  instances: Map<string, InternalWidgetInstance>;
  isLoaded: boolean;
  loadPromise: Promise<void> | null;
};

type InternalWidgetInstance = {
  config: WidgetConfig;
  container: HTMLElement;
  shadowRoot: ShadowRoot | null;
  api: CDNWidgetInstance | null;
};

// URLs do CDN (CloudFront para production)
// Usa variável de ambiente se disponível, fallback para CloudFront production
const CDN_BASE_URL =
  import.meta.env.VITE_CDN_BASE_URL || "https://d2x7cg3k3on9lk.cloudfront.net";
const WIDGET_BUNDLE_URL = `${CDN_BASE_URL}/widget.v1.min.js`;
const WIDGET_CSS_URL = `${CDN_BASE_URL}/widget.v1.min.css`;
const CONTAINER_ID_PREFIX = "__payment_widget_root__";
const ROOT_ELEMENT_ID = "pw-root";
const RETRY_DELAY_MS = 100;
const MAX_RETRIES = 50;

class PaymentWidgetBootstrap {
  private readonly state: BootstrapState = {
    instances: new Map(),
    isLoaded: false,
    loadPromise: null,
  };

  /**
   * Inicializa o widget com configuração
   */
  async init(config: WidgetConfig): Promise<void> {
    try {
      // Valida configuração mínima
      if (!config.merchantId) {
        throw new Error("merchantId é obrigatório");
      }

      // Verifica se já existe uma instância para este merchantId
      if (this.state.instances.has(config.merchantId)) {
        logger.warn(
          `Widget já inicializado para merchantId: ${config.merchantId}`
        );
        return;
      }

      // Cria container isolado
      const container = this.createContainer(config.merchantId);

      // Cria Shadow DOM (com fallback para iframe)
      const shadowRoot = this.createShadowDOM(container);

      // Cria instância
      const instance: InternalWidgetInstance = {
        config,
        container,
        shadowRoot,
        api: null,
      };

      this.state.instances.set(config.merchantId, instance);

      // Carrega UI bundle assincronamente se necessário
      await this.loadUIBundle();

      // Inicializa o widget UI
      instance.api = await this.initializeUI(instance);

      // Auto-open se configurado
      if (config.autoOpen) {
        this.open(config.merchantId);
      }

      // Callback onOpen se definido
      if (config.onOpen) {
        config.onOpen();
      }
    } catch (error) {
      logger.error("Erro ao inicializar Payment Widget:", error);
      if (config.onError) {
        config.onError({
          code: "INIT_ERROR",
          message: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }
  }

  /**
   * Abre o modal do widget
   */
  open(merchantId?: string): void {
    const targetMerchantId = merchantId || this.getFirstMerchantId();

    if (!targetMerchantId) {
      logger.error("Nenhum widget inicializado");
      return;
    }

    const instance = this.state.instances.get(targetMerchantId);
    if (!instance?.api) {
      logger.error(
        `Widget não encontrado para merchantId: ${targetMerchantId}`
      );
      return;
    }

    // Habilita interação com o container
    instance.container.style.pointerEvents = "auto";

    instance.api.open();
  }

  /**
   * Fecha o modal do widget
   */
  close(merchantId?: string): void {
    const targetMerchantId = merchantId || this.getFirstMerchantId();

    if (!targetMerchantId) {
      return;
    }

    const instance = this.state.instances.get(targetMerchantId);
    if (instance?.api) {
      instance.api.close();

      // Desabilita interação com o container após fechar
      instance.container.style.pointerEvents = "none";
    }
  }

  /**
   * Destroi uma instância do widget
   */
  destroy(merchantId?: string): void {
    const targetMerchantId = merchantId || this.getFirstMerchantId();

    if (!targetMerchantId) {
      return;
    }

    const instance = this.state.instances.get(targetMerchantId);
    if (instance) {
      // Cleanup da instância
      if (instance.api?.destroy) {
        instance.api.destroy();
      }

      // Remove container do DOM
      if (instance.container.parentNode) {
        instance.container.parentNode.removeChild(instance.container);
      }

      // Remove da state
      this.state.instances.delete(targetMerchantId);
    }
  }

  /**
   * Cria container isolado no DOM
   */
  private createContainer(merchantId: string): HTMLElement {
    const containerId = `${CONTAINER_ID_PREFIX}${merchantId}`;

    // Verifica se já existe
    const existing = document.getElementById(containerId);
    if (existing) {
      return existing;
    }

    const container = document.createElement("div");
    container.id = containerId;
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      pointer-events: none;
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Cria Shadow DOM com fallback para iframe
   */
  private createShadowDOM(container: HTMLElement): ShadowRoot | null {
    try {
      // Tenta criar Shadow DOM
      if (container.attachShadow) {
        const shadowRoot = container.attachShadow({ mode: "open" });

        // Injeta CSS no Shadow DOM
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = WIDGET_CSS_URL;
        style.crossOrigin = "anonymous";
        shadowRoot.appendChild(style);

        // Cria div root dentro do shadow
        const rootDiv = document.createElement("div");
        rootDiv.id = ROOT_ELEMENT_ID;
        rootDiv.className = "pw-root payment-widget";
        shadowRoot.appendChild(rootDiv);

        return shadowRoot;
      }
    } catch (error) {
      logger.warn("Shadow DOM não suportado, usando fallback iframe:", error);
    }

    // Fallback: cria iframe sandbox
    this.createIframeFallback(container);
    return null;
  }

  /**
   * Fallback para iframe sandbox quando Shadow DOM não é suportado
   */
  private createIframeFallback(container: HTMLElement): void {
    const iframe = document.createElement("iframe");
    iframe.id = ROOT_ELEMENT_ID;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    `;

    // Configura sandbox com permissões mínimas
    iframe.sandbox.add(
      "allow-scripts",
      "allow-same-origin",
      "allow-forms",
      "allow-popups"
    );

    container.appendChild(iframe);
  }

  /**
   * Carrega o bundle da UI assincronamente
   */
  private loadUIBundle(): Promise<void> {
    if (this.state.isLoaded) {
      return Promise.resolve();
    }

    if (this.state.loadPromise) {
      return this.state.loadPromise;
    }

    this.state.loadPromise = new Promise((resolve, reject) => {
      // Verifica se já foi carregado por outro script
      if (window.CartaoSimplesWidget) {
        this.state.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = WIDGET_BUNDLE_URL;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        this.state.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Falha ao carregar widget bundle"));
      };

      document.head.appendChild(script);
    });

    return this.state.loadPromise;
  }

  /**
   * Inicializa a UI do widget
   */
  private async initializeUI(
    instance: InternalWidgetInstance
  ): Promise<CDNWidgetInstance> {
    // Aguarda o bundle estar disponível
    let retries = 0;

    while (!window.CartaoSimplesWidget && retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      retries++;
    }

    if (!window.CartaoSimplesWidget) {
      throw new Error("Widget UI bundle não carregado");
    }

    // Encontra o elemento root (Shadow DOM ou iframe)
    let rootElement: HTMLElement;

    if (instance.shadowRoot) {
      const shadowElement = instance.shadowRoot.getElementById(ROOT_ELEMENT_ID);
      if (!shadowElement) {
        throw new Error("Elemento root não encontrado no Shadow DOM");
      }
      rootElement = shadowElement;
    } else {
      // Para iframe fallback
      const iframe = instance.container.querySelector("iframe");
      rootElement = iframe?.contentDocument?.body || instance.container;
    }

    if (!rootElement) {
      throw new Error("Elemento root não encontrado");
    }

    // Aplica tema white-label via CSS variables
    this.applyTheme(rootElement, instance.config);

    // Cria config modificado com callback de close interceptado
    const wrappedConfig = {
      ...instance.config,
      onClose: () => {
        // Desabilita pointer-events quando o modal fecha
        instance.container.style.pointerEvents = "none";

        // Chama callback original se existir
        if (instance.config.onClose) {
          instance.config.onClose();
        }
      },
    };

    // Monta o componente React
    return window.CartaoSimplesWidget.mount(rootElement, wrappedConfig);
  }

  /**
   * Aplica tema white-label via CSS variables
   */
  private applyTheme(element: HTMLElement, config: WidgetConfig): void {
    const style = element.style || document.documentElement.style;

    if (config.theme?.primaryColor) {
      style.setProperty("--pw-primary", config.theme.primaryColor);
    }

    if (config.theme?.secondaryColor) {
      style.setProperty("--pw-secondary", config.theme.secondaryColor);
    }

    if (config.logoUrl) {
      style.setProperty("--pw-logo-url", `url(${config.logoUrl})`);
    }

    if (config.theme?.borderRadius) {
      const borderRadius = this.parseBorderRadius(config.theme.borderRadius);
      style.setProperty("--pw-border-radius", borderRadius);
    }
  }

  /**
   * Converte borderRadius config para CSS
   */
  private parseBorderRadius(radius: string): string {
    const presets = {
      sm: "4px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    };

    return presets[radius as keyof typeof presets] || radius;
  }

  /**
   * Obtém o primeiro merchantId disponível
   */
  private getFirstMerchantId(): string | undefined {
    return Array.from(this.state.instances.keys())[0];
  }

  /**
   * Obtém o estado público do widget
   */
  getState(): WidgetState {
    const firstMerchantId = this.getFirstMerchantId();
    const instance = firstMerchantId
      ? this.state.instances.get(firstMerchantId)
      : null;

    // Obtém estado da API do widget
    let isOpen = false;
    if (instance?.api?.getState) {
      try {
        const apiState = instance.api.getState();
        isOpen = apiState?.isOpen ?? false;
      } catch (error) {
        logger.warn("Erro ao obter estado da API:", error);
      }
    }

    return {
      isLoaded: this.state.isLoaded,
      isOpen,
      isLoading: false,
      currentStep: "authorization",
      creditAnalysis: undefined,
      address: undefined,
      payment: undefined,
      isApproved: undefined,
      error: undefined,
    };
  }
}

// Instância global
const bootstrap = new PaymentWidgetBootstrap();

// API pública global
window.PaymentWidget = {
  init: (config: WidgetConfig) => bootstrap.init(config),
  open: (merchantId?: string) => bootstrap.open(merchantId),
  close: (merchantId?: string) => bootstrap.close(merchantId),
  destroy: (merchantId?: string) => bootstrap.destroy(merchantId),
  getState: () => bootstrap.getState(),
};

// Auto-inicialização via data attributes ou window.PaymentWidgetInit
document.addEventListener("DOMContentLoaded", () => {
  // Método 1: via data-* attributes do script
  const currentScript = document.currentScript as HTMLScriptElement;
  if (currentScript) {
    const config = extractConfigFromDataAttributes(currentScript);
    if (config.merchantId) {
      bootstrap.init(config);
    }
  }

  // Método 2: via window.PaymentWidgetInit
  if (window.PaymentWidgetInit) {
    bootstrap.init(window.PaymentWidgetInit);
  }
});

/**
 * Extrai configuração dos data-* attributes do script
 */
function extractConfigFromDataAttributes(
  script: HTMLScriptElement
): WidgetConfig {
  const dataset = script.dataset;

  return {
    merchantId: dataset.merchantId || "",
    theme: {
      primaryColor: dataset.primary || dataset.primaryColor,
      secondaryColor: dataset.secondary || dataset.secondaryColor,
      borderRadius: dataset.borderRadius as
        | "sm"
        | "md"
        | "lg"
        | "full"
        | undefined,
    },
    logoUrl: dataset.logo || dataset.logoUrl,
    environment: (dataset.env || dataset.environment) as
      | "staging"
      | "production",
    apiBaseUrl: dataset.apiBaseUrl,
    autoOpen: dataset.autoOpen === "true",
  };
}

export default bootstrap;
