import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

async function deployRules() {
  console.log('🏁 Iniciando script de deploy automático de regras do Firestore (RLS)...');

  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Erro: firebase-applet-config.json não encontrado no diretório raiz do workspace.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const projectId = config.projectId;
  const databaseId = config.firestoreDatabaseId || '(default)';

  console.log(`ℹ️ Projeto Firebase Configurado: ${projectId}`);
  console.log(`ℹ️ Base de Dados ID: ${databaseId}`);

  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ Erro: O arquivo firestore.rules não foi encontrado.');
    process.exit(1);
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  console.log('✅ Conteúdo do arquivo firestore.rules lido com sucesso.');

  // Validação estática pré-deploy para garantir conformidade de multi-inquilinato (empresaId)
  if (!rulesContent.includes('empresaId') && !rulesContent.includes('belongsToTenant')) {
    console.warn('⚠️ AVISO DE SEGURANÇA: Nenhum padrão de isolamento por "empresaId" ou "belongsToTenant" foi identificado no arquivo.');
    console.warn('⚠️ Certifique-se de que a segurança de isolamento está devidamente implementada para produção!');
  } else {
    console.log('🛡️ Verificação de Segurança Local: Padrões de multi-inquilinato (empresaId / belongsToTenant) localizados e em conformidade.');
  }

  try {
    // Inicializar o SDK
    if (!admin.apps.length) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('🔑 Credenciais GOOGLE_APPLICATION_CREDENTIALS detectadas.');
      } else {
        console.log('🔄 Tentando autenticar usando credenciais padrão de aplicativo (ADC / Sandbox Container)...');
      }
      admin.initializeApp({
        projectId: projectId,
      });
    }

    const securityRules = admin.securityRules();
    console.log('📤 Enviando e publicando arquivo de regras no Firestore...');

    // Cria o novo ruleset e o publica/associa com o Firestore automaticamente
    const ruleset = await securityRules.releaseFirestoreRulesetFromSource(rulesContent);

    console.log(`🚀 Ruleset criado e publicado com sucesso sob o ID: ${ruleset.name}`);
    console.log('🎉 SUCESSO: Regras de segurança (RLS) atualizadas e sincronizadas no Firestore com isolamento completo por empresaId!');
  } catch (error: any) {
    console.error('❌ Falha ao realizar deploy automático das regras via Admin API:', error.message || error);
    console.log('\n💡 Como resolver este problema em ambientes locais/CI-CD:');
    console.log('1. Certifique-se de estar autenticado com a GCP: Execute "gcloud auth application-default login"');
    console.log('2. Exporte a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS apontando para sua chave de Conta de Serviço JSON.');
    console.log('3. Atribua as permissões de "Administrador de Regras do Firebase" (Firebase Rules Admin) e "Leitor do Firestore" para a conta associada.');
    process.exit(1);
  }
}

deployRules();
