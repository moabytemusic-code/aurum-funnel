(function() {
  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --bot-bg: #1E293B;
      --user-bg: #0073FF;
    }
    .bot-trigger {
      position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px;
      background: var(--aurum-blue, #0073FF); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 10px 25px rgba(0, 115, 255, 0.4);
      transition: transform 0.3s ease; z-index: 9999;
    }
    .bot-trigger:hover { transform: scale(1.1); }
    .bot-trigger svg { color: #fff; width: 30px; height: 30px; }

    .bot-window {
      position: fixed; bottom: 100px; right: 30px; width: 380px; height: 600px; max-height: 80vh;
      background: var(--dark-panel, #0F172A); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      display: flex; flex-direction: column; overflow: hidden;
      transform: translateY(20px); opacity: 0; pointer-events: none;
      transition: all 0.3s ease; z-index: 9998;
    }
    .bot-window.open { transform: translateY(0); opacity: 1; pointer-events: auto; }

    .bot-header {
      background: rgba(0,0,0,0.4); padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; align-items: center; justify-content: space-between; color: white;
    }
    .bot-title { font-weight: 800; display: flex; align-items: center; gap: 10px; }
    .bot-title span { display: block; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e;}
    .close-bot { cursor: pointer; color: #94A3B8; font-size: 1.5rem; line-height: 1; }
    .close-bot:hover { color: #fff; }

    .bot-messages {
      flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
      color: white; font-family: 'Inter', sans-serif;
    }

    .message {
      max-width: 85%; padding: 14px 18px; border-radius: 12px; font-size: 0.95rem; line-height: 1.5;
      animation: msgIn 0.3s ease forwards;
    }
    @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .msg-bot { background: var(--bot-bg); align-self: flex-start; border-bottom-left-radius: 4px; }
    .msg-user { background: var(--user-bg); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    
    .msg-bot ol, .msg-bot ul { padding-left: 20px; margin-top: 8px; margin-bottom: 8px; }
    .msg-bot li { margin-bottom: 6px; }

    .bot-options { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .option-btn {
      background: transparent; border: 1px solid var(--aurum-blue, #0073FF);
      color: var(--aurum-blue, #0073FF); padding: 10px 14px; border-radius: 8px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: left;
      transition: all 0.2s ease;
    }
    .option-btn:hover { background: rgba(0, 115, 255, 0.1); color: #fff; }

    .bot-messages::-webkit-scrollbar { width: 6px; }
    .bot-messages::-webkit-scrollbar-track { background: transparent; }
    .bot-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

    @media (max-width: 768px) {
      .bot-window { width: calc(100% - 40px); bottom: 100px; right: 20px; }
      .bot-trigger { bottom: 80px; right: 20px; } /* Above the sticky CTA */
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const botHTML = `
    <!-- WIDGET TRIGGER -->
    <div class="bot-trigger" id="botTriggerBtn">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16.5c0 1.93-2.09 3.5-4.67 3.5H7.33C4.76 20 2.67 18.43 2.67 16.5v-9C2.67 5.57 4.76 4 7.33 4h9.34C19.24 4 21.33 5.57 21.33 7.5v9z"></path>
      </svg>
    </div>

    <!-- WIDGET WINDOW -->
    <div class="bot-window" id="botWindow">
      <div class="bot-header">
        <div class="bot-title"><span></span> Aurum Onboarding AI</div>
        <div class="close-bot" id="closeBotBtn">&times;</div>
      </div>
      <div class="bot-messages" id="botChat"></div>
    </div>
  `;
  const container = document.createElement('div');
  container.innerHTML = botHTML;
  document.body.appendChild(container);

  // Logic
  const chatContainer = document.getElementById('botChat');
  
  const knowledgeBase = {
    "signup": `
      Here is how to create your account:
      <ol>
        <li>Download and open <strong>Proton VPN</strong> (Free).</li>
        <li><b>IMPORTANT FOR US/CA/MX:</b> Set your VPN location to Europe or Asia. When signing up, choose "U.S. Minor Outlying Islands" for your country. For your phone, select "CRYPTONATION" at the very bottom. Then use your normal number.</li>
        <li>Complete your profile details.</li>
        <li>Check your email and paste the confirmation code.</li>
      </ol>
      <p><b>PRO TIP:</b> Take a photo to have ready for the next page!</p>
    `,
    "costs": `
      It is completely free to join and explore the AURUM ecosystem. 
      However, to start generating returns, you will need:
      <ul>
        <li><b>$19.99</b> for the annual membership fee.</li>
        <li>A minimum of <b>$100 USD</b> for the trading bot.</li>
      </ul>
      <p>Ensure you have matching crypto for gas fees in your wallet!</p>
    `,
    "video": `
      Sure! Here is the official Onboarding Guide Video:
      <br><br>
      <iframe width="100%" height="200" src="https://www.youtube.com/embed/TL5LHCLY7eA?rel=0" frameborder="0" allowfullscreen></iframe>
    `,
    "exodus": `
      To transfer funds:
      <ol>
        <li>Select Cash and click Send.</li>
        <li>Select the destination wallet.</li>
        <li>Select the correct network.</li>
        <li>Send and wait ~1 min for it to appear.</li>
      </ol>
    `,
    "topup": `
      To top-up your balance:
      <ol>
        <li>Swap to the correct asset type.</li>
        <li>Go to Finance > Top Up.</li>
        <li>Select Asset and Network.</li>
        <li>Send funds to the QR code/address provided. It takes ~30 mins.</li>
      </ol>
    `,
    "neyro_topup": `
      To top-up the Agent:
      <ol>
        <li>Click Connect Wallet in the top right.</li>
        <li>Select the supported Web3 Wallet.</li>
        <li>Click <strong>Top-up Agent</strong>.</li>
        <li>Swap to the correct asset and scan the QR code.</li>
      </ol>
    `,
    "neyro_withdraw": `
      To withdraw profit:
      <ol>
        <li>Click <strong>Withdraw Profit</strong> in the middle of the page.</li>
        <li>Your Available Profit will go to zero.</li>
        <li>After a minute, your external balance will increase!</li>
      </ol>
      To withdraw capital, click <strong>Close Agent</strong> (starts a 48hr countdown).
    `
  };

  document.getElementById('botTriggerBtn').addEventListener('click', toggleBot);
  document.getElementById('closeBotBtn').addEventListener('click', toggleBot);

  function toggleBot() {
    const win = document.getElementById('botWindow');
    if(win.classList.contains('open')) {
      win.classList.remove('open');
    } else {
      win.classList.add('open');
      if(chatContainer.children.length === 0) {
        sendBotMessage("Hello! I'm the Aurum Helper Bot. I can guide you through the setup and onboarding process. What do you need help with?", [
          { text: "What are the costs & fees?", action: "costs" },
          { text: "Show me the Onboarding Video", action: "video" },
          { text: "How do I create an account & use VPN?", action: "signup" },
          { text: "How do I move funds to Exodus?", action: "exodus" },
          { text: "How do I top-up my Aurum balance?", action: "topup" },
          { text: "How do I top-up my Neyro Agent?", action: "neyro_topup" },
          { text: "How do I withdraw my profits?", action: "neyro_withdraw" }
        ]);
      }
    }
  }

  function sendBotMessage(text, options = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message msg-bot';
    msgDiv.innerHTML = text;
    
    if(options.length > 0) {
      const optsDiv = document.createElement('div');
      optsDiv.className = 'bot-options';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => handleUserSelection(opt.text, opt.action);
        optsDiv.appendChild(btn);
      });
      msgDiv.appendChild(optsDiv);
    }
    
    chatContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function sendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message msg-user';
    msgDiv.innerText = text;
    chatContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function handleUserSelection(userText, actionId) {
    const allOptions = document.querySelectorAll('.bot-options');
    allOptions.forEach(el => el.remove());

    sendUserMessage(userText);

    if(actionId === "menu") {
      setTimeout(() => {
        sendBotMessage("What else can I assist you with?", [
          { text: "What are the costs & fees?", action: "costs" },
          { text: "Show me the Onboarding Video", action: "video" },
          { text: "How do I create an account & use VPN?", action: "signup" },
          { text: "How do I move funds to Exodus?", action: "exodus" },
          { text: "How do I top-up my Aurum balance?", action: "topup" },
          { text: "How do I top-up my Neyro Agent?", action: "neyro_topup" },
          { text: "How do I withdraw my profits?", action: "neyro_withdraw" }
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        sendBotMessage(knowledgeBase[actionId], [
          { text: "I need help with something else", action: "menu" }
        ]);
      }, 600);
    }
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
})();
