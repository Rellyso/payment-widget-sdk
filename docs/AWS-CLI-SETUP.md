# ⚙️ Guia de Configuração do AWS CLI para este Projeto

Este guia ensina a configurar o AWS CLI corretamente (com macOS) para usar os scripts deste repositório: `setup-cloudfront.sh` e `deploy.sh`.

- Sistema: macOS (Apple Silicon/Intel)
- Shell: uso do homebrew para instalação (ou instalador),
- Serviços: S3 + CloudFront (global)
- Objetivo: Fazer deploy para `cartao-simples-widget` (produção) e `cartao-simples-widget-staging` (staging), invalidar CloudFront `EOLJNTE5PW5O9` e executar setup quando necessário.

---

## 1) Instalar o AWS CLI v2 (macOS)

Opção A — Homebrew (recomendado)

```fish
# Instalar
brew install awscli

# Verificar
aws --version
# aws-cli/2.x.x Python/3.x.x ...
```

Opção B — Instalador oficial

- Baixe: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Siga o instalador `.pkg` para macOS

Desabilite o pager (evita travar o terminal em comandos longos):

```fish
set -Ux AWS_PAGER ""
```

---

## 2) Escolha do método de autenticação

Você pode autenticar de duas formas. Escolha UMA:

### Método 1 — Access Key (simples)

- Necessita um usuário IAM com Access Key ID e Secret Access Key.
- Ideal para repositório pessoal/equipe pequena.

Crie um perfil para cada ambiente (staging e produção):

```fish
aws configure --profile cs-widget-staging
# AWS Access Key ID [None]: AKIA...
# AWS Secret Access Key [None]: ****************
# Default region name [None]: us-east-1
# Default output format [None]: json

aws configure --profile cs-widget-prod
# ... idem ...
```

Recomendado:

- Region padrão: `us-east-1` (CloudFront é global; buckets podem estar em outra região, veja seção 4.3)
- Output: `json`

### Método 2 — AWS SSO (empresas/organizacional)

- Para contas com AWS IAM Identity Center (SSO).

```fish
aws configure sso --profile cs-widget-staging
# Organization, SSO start URL, region, account ID e role

aws configure sso --profile cs-widget-prod
# ... idem ...

# Login e cache de credenciais
aws sso login --profile cs-widget-staging
aws sso login --profile cs-widget-prod
```

---

## 3) Definir profile e região no fish shell

Os scripts usam o AWS CLI sem `--profile`. A forma mais simples é definir `AWS_PROFILE` antes de executar.

Definir permanentemente (fish):

```fish
# Staging (padrão durante desenvolvimento)
set -Ux AWS_PROFILE cs-widget-staging
set -Ux AWS_REGION us-east-1

# Produção (quando for usar)
# set -Ux AWS_PROFILE cs-widget-prod
# set -Ux AWS_REGION us-east-1
```

Definir apenas para a sessão atual (não persistente):

```fish
set -x AWS_PROFILE cs-widget-staging
set -x AWS_REGION us-east-1
```

Usar de forma temporária ao chamar um comando:

```fish
AWS_PROFILE=cs-widget-prod AWS_REGION=us-east-1 ./deploy.sh production
```

Dica: se preferir alterar os scripts para aceitar `--profile`, basta passar `--profile $AWS_PROFILE` em cada comando `aws` (opcional; não necessário se a variável de ambiente estiver definida).

---

## 4) Permissões IAM mínimas (least privilege)

Crie uma policy com permissões mínimas para os scripts deste projeto.

### 4.1) Deploy regular (S3 + CloudFront Invalidation)

Substitua os nomes dos buckets se necessário:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3List",
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::cartao-simples-widget",
        "arn:aws:s3:::cartao-simples-widget-staging"
      ]
    },
    {
      "Sid": "S3PutGetObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::cartao-simples-widget/*",
        "arn:aws:s3:::cartao-simples-widget-staging/*"
      ]
    },
    {
      "Sid": "S3BucketConfig",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketCors",
        "s3:PutBucketCors",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy"
      ],
      "Resource": [
        "arn:aws:s3:::cartao-simples-widget",
        "arn:aws:s3:::cartao-simples-widget-staging"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4.2) Setup inicial (CloudFront + OAI)

Necessário apenas para `setup-cloudfront.sh` (primeira vez):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:CreateCloudFrontOriginAccessIdentity",
        "cloudfront:GetCloudFrontOriginAccessIdentity"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutBucketPolicy", "s3:GetBucketPolicy"],
      "Resource": [
        "arn:aws:s3:::cartao-simples-widget",
        "arn:aws:s3:::cartao-simples-widget-staging"
      ]
    }
  ]
}
```

Anexe essa policy a um usuário/role usado pelos perfis `cs-widget-staging` e `cs-widget-prod`.

---

## 5) Verificações rápidas (sanity checks)

Confirme se seu perfil está ativo:

```fish
# Quem sou eu na AWS?
aws sts get-caller-identity

# Listar buckets (confira acesso)
aws s3 ls

# Verificar acesso ao CloudFront
aws cloudfront list-distributions | jq '.DistributionList.Items[].Id'
```

Detectar a região do bucket caso desconhecida:

```fish
aws s3api get-bucket-location --bucket cartao-simples-widget
# Retorna null ou uma região (null == us-east-1)
```

Se o bucket não estiver em `us-east-1`, ajuste `AWS_REGION` antes do deploy:

```fish
set -Ux AWS_REGION sa-east-1
```

---

## 6) Como usar com os scripts deste projeto

Staging (recomendado para testar):

```fish
set -x AWS_PROFILE cs-widget-staging
set -x AWS_REGION us-east-1

./deploy.sh staging
```

Produção:

```fish
set -x AWS_PROFILE cs-widget-prod
set -x AWS_REGION us-east-1

./deploy.sh production
```

Setup inicial de CloudFront (apenas uma vez por ambiente):

```fish
# Staging
set -x AWS_PROFILE cs-widget-staging
./setup-cloudfront.sh staging

# Produção
set -x AWS_PROFILE cs-widget-prod
./setup-cloudfront.sh production
```

---

## 7) Problemas comuns e soluções

- "Unable to locate credentials":

  - Defina `AWS_PROFILE` (fish: `set -x AWS_PROFILE cs-widget-staging`).
  - Verifique `~/.aws/credentials` e `~/.aws/config`.

- "AccessDenied" (S3/CloudFront):

  - Permissões IAM insuficientes (revise as policies da seção 4).
  - Bucket/região incorretos.

- "The specified key does not exist" (S3):

  - Caminho/arquivo incorreto no upload ou falta de permissão.

- Cache desatualizado (CDN):

  - Rode invalidation manual:
    ```fish
    aws cloudfront create-invalidation \
      --distribution-id EOLJNTE5PW5O9 \
      --paths "/*"
    ```

- Região CloudFront:
  - CloudFront é global, mas o CLI requer uma região padrão (use `us-east-1`).

---

## 8) Boas práticas

- Use perfis nomeados separados para `staging` e `production`.
- Não commite chaves no repositório. Nunca use `.env` com secrets aqui.
- Prefira **SSO** se sua organização oferecer IAM Identity Center.
- Habilite MFA para usuários com Access Keys.
- Restrinja políticas IAM ao mínimo necessário.
- Configure `AWS_PAGER=""` para evitar pager interativo.
- Audite ações sensíveis com CloudTrail (conta AWS).

---

## 9) Referências

- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html
- S3 CLI: https://docs.aws.amazon.com/cli/latest/reference/s3/
- CloudFront CLI: https://docs.aws.amazon.com/cli/latest/reference/cloudfront/
- IAM Policies: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html

---

Pronto! Com o AWS CLI configurado, você pode executar `./deploy.sh staging` e `./deploy.sh production` com segurança.
