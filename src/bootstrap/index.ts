/**
 * Payment Widget Bootstrap
 * Lightweight loader script (1-3KB gzipped)
 * Lê configurações via data-* attributes e inicializa o widget
 */

import type { WidgetAPI, WidgetConfig } from "../types";
import { logger } from "../utils/logger";

type BootstrapState = {
  instances: Map<string, WidgetInstance>;
  isLoaded: boolean;
  loadPromise: Promise<void> | null;
};

type WidgetInstance = {
  config: WidgetConfig;
  container: HTMLElement;
  shadowRoot: ShadowRoot | null;
  api: WidgetAPI | null;
};

const CDN_BASE_URL = "https://d2x7cg3k3on9lk.cloudfront.net";
const WIDGET_BUNDLE_URL = `${CDN_BASE_URL}/widget.v1.min.js`;
const CONTAINER_ID_PREFIX = "__payment_widget_root__";
const ROOT_ELEMENT_ID = "pw-root";
const RETRY_DELAY_MS = 100;
const MAX_RETRIES = 50;

class PaymentWidgetBootstrap {
  private state: BootstrapState = {
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
      const instance: WidgetInstance = {
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

    instance.api.open();
  }

  /**
   * Fecha o modal do widget
   */
  close(merchantId?: string): void {
    const targetMerchantId = merchantId || this.getFirstMerchantId();

    if (!targetMerchantId) return;

    const instance = this.state.instances.get(targetMerchantId);
    if (instance?.api) {
      instance.api.close();
    }
  }

  /**
   * Destroi uma instância do widget
   */
  destroy(merchantId?: string): void {
    const targetMerchantId = merchantId || this.getFirstMerchantId();

    if (!targetMerchantId) return;

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
      display: none;
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
  private async loadUIBundle(): Promise<void> {
    if (this.state.isLoaded) return;

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
  private async initializeUI(instance: WidgetInstance): Promise<any> {
    // Aguarda o bundle estar disponível
    let retries = 0;
    const maxRetries = 50; // 5 segundos

    while (!window.CartaoSimplesWidget && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.CartaoSimplesWidget) {
      throw new Error("Widget UI bundle não carregado");
    }

    // Encontra o elemento root (Shadow DOM ou iframe)
    let rootElement: HTMLElement;

    if (instance.shadowRoot) {
      rootElement = instance.shadowRoot.getElementById(ROOT_ELEMENT_ID);
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

    // Monta o componente React
    return window.CartaoSimplesWidget.mount(rootElement, instance.config);
  }

  /**
   * Aplica tema white-label via CSS variables
   */
  private applyTheme(element: HTMLElement, config: WidgetConfig): void {
    const style = element.style || document.documentElement.style;

    if (config.primaryColor) {
      style.setProperty("--pw-primary", config.primaryColor);
    }

    if (config.secondaryColor) {
      style.setProperty("--pw-secondary", config.secondaryColor);
    }

    if (config.logoUrl) {
      style.setProperty("--pw-logo-url", `url(${config.logoUrl})`);
    }

    if (config.borderRadius) {
      const borderRadius = this.parseBorderRadius(config.borderRadius);
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
}

// Instância global
const bootstrap = new PaymentWidgetBootstrap();

// API pública global
window.PaymentWidget = {
  init: (config: WidgetConfig) => bootstrap.init(config),
  open: (merchantId?: string) => bootstrap.open(merchantId),
  close: (merchantId?: string) => bootstrap.close(merchantId),
  destroy: (merchantId?: string) => bootstrap.destroy(merchantId),
  getState: () => ({ isLoaded: bootstrap["state"].isLoaded }),
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
    primaryColor: dataset.primary || dataset.primaryColor,
    secondaryColor: dataset.secondary || dataset.secondaryColor,
    logoUrl: dataset.logo || dataset.logoUrl,
    borderRadius: dataset.borderRadius,
    environment: (dataset.env || dataset.environment) as
      | "staging"
      | "production",
    apiBaseUrl: dataset.apiBaseUrl,
    autoOpen: dataset.autoOpen === "true",
  };
}

export default bootstrap;
