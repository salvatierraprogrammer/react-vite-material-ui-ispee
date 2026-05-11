/**
 * Script para asignar rol admin a usuarios.
 * Uso: node set-admin.js "email@test.com"
 * 
 * Requiere Firestore Admin SDK o Firebase CLI autenticado.
 */

const https = require('https');

const PROJECT_ID = 'react-vite-material-ui-ispee';
const emails = process.argv.slice(2);

async function getIdToken() {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch {
            reject(new Error('Failed to parse response'));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: emails[0] || '' }
          }
        },
        limit: 1
      }
    }));
    req.end();
  });
}

// Alternativa: usar Firebase REST API con clave de API
async function updateUserRole(email, role) {
  const API_KEY = process.env.VITE_FIREBASE_API_KEY;
  if (!API_KEY) {
    console.log('❌ Se necesita VITE_FIREBASE_API_KEY en .env.local');
    console.log('\n📋 Alternativa: Actualizar manualmente en Firebase Console:');
    console.log('1. Ir a https://console.firebase.google.com');
    console.log('2. Seleccionar proyecto:', PROJECT_ID);
    console.log('3. Firestore Database > Colección "users"');
    console.log('4. Buscar documento por email y cambiar "role" a "admin"');
    return;
  }

  console.log(`\n🔍 Buscando usuario: ${email}`);

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'users' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'email' },
                op: 'EQUAL',
                value: { stringValue: email }
              }
            },
            limit: 1
          }
        })
      }
    );

    const results = await response.json();

    if (results.length === 0 || !results[0]?.document) {
      console.log(`⚠️  Usuario no encontrado: ${email}`);
      return;
    }

    const docId = results[0].document.name.split('/').pop();
    const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/users/${docId}`;

    console.log(`✅ Usuario encontrado: ${docId}`);
    console.log(`📝 Actualizando rol a "${role}"...`);

    const updateResponse = await fetch(
      `https://firestore.googleapis.com/v1/${docPath}?key=${API_KEY}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            role: { stringValue: role }
          }
        })
      }
    );

    if (updateResponse.ok) {
      console.log(`✅ Rol actualizado exitosamente para ${email}`);
    } else {
      console.log(`❌ Error al actualizar: ${updateResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  if (emails.length === 0) {
    console.log('Uso: node set-admin.js "email@test.com" ["email2@test.com" ...]');
    console.log('\n📋 O actualizar manualmente en Firebase Console:');
    console.log('1. Ir a https://console.firebase.google.com');
    console.log('2. Seleccionar proyecto:', PROJECT_ID);
    console.log('3. Firestore Database > Colección "users"');
    console.log('4. Buscar documento por email y cambiar "role" a "admin"');
    return;
  }

  for (const email of emails) {
    await updateUserRole(email, 'admin');
  }
}

main();