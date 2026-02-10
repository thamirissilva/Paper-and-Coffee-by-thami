
# Paper&Coffee - Gestão para Papelaria Criativa ☕✨

O **Paper&Coffee** é um sistema completo de gestão para pequenos negócios de papelaria personalizada e encadernação. Desenvolvido com foco na estética de cafeteria (Cozy Coffee) e alta produtividade.

## 🚀 Tecnologias
- **React 19** + **Vite**
- **Tailwind CSS** (Estilização)
- **Firebase** (Auth, Firestore, Hosting)
- **Google Gemini API** (Inteligência para precificação e ideias)
- **Lucide React** (Ícones)

## 📦 Como Instalar e Rodar
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/paper-and-coffee.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🔥 Configuração do Firebase (Importante)
Para que o sistema salve os dados corretamente na nuvem, você deve configurar as **Regras de Segurança** no seu projeto Firebase:

1. No Console do Firebase, vá em **Firestore Database**.
2. Clique na aba **Rules**.
3. Cole o seguinte código e clique em **Publish**:
   ```javascript
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/data/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. Em **Authentication**, ative o provedor de **E-mail/Senha**.

## 🎨 Temas
O sistema suporta troca dinâmica de temas (Clássico Café e Pastel Criativo) através das configurações.

## 🇧🇷 Fuso Horário e Idioma
Configurado nativamente para o fuso horário de Brasília e idioma Português (Brasil).

---
Desenvolvido com ❤️ para criativos brasileiros.
