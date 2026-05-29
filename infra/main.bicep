targetScope = 'resourceGroup'

// ── Parameters ────────────────────────────────────────────────────────────────
@minLength(1)
@maxLength(64)
@description('azd environment name — used to generate unique resource names')
param environmentName string

@minLength(1)
@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Container image to deploy (set by azd after first push)')
param imageName string = ''

// ── Variables ─────────────────────────────────────────────────────────────────
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }
var acrName = 'acr${resourceToken}'

// ── Log Analytics (free 5 GB/mo ingestion) ────────────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-${resourceToken}'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ── Azure Container Registry — Basic (~$5/mo) ─────────────────────────────────
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: true
  }
}

// ── Container Apps Environment — Consumption (scales to 0) ────────────────────
resource cae 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${resourceToken}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ── Container App ─────────────────────────────────────────────────────────────
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-web-${resourceToken}'
  location: location
  tags: union(tags, { 'azd-service-name': 'web' })
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.name
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          // Placeholder until azd deploy pushes the real image
          image: !empty(imageName) ? imageName : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.25')   // cheapest supported allocation
            memory: '0.5Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '3000' }
          ]
        }
      ]
      scale: {
        minReplicas: 0   // scale to zero when idle — no cost
        maxReplicas: 3
      }
    }
  }
}

// ── Outputs (consumed by azd and post-deploy scripts) ─────────────────────────
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = acr.name
output SERVICE_WEB_URI string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output SERVICE_WEB_NAME string = containerApp.name
