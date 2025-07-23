

console.log("Email writer Extension -- Content Script Loaded");

// Dynamically load Material Icons
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'ai-reply-button';

    button.innerHTML = `
      <span class="material-icons" style="font-size:16px; margin-right:6px;">smart_toy</span>
      AI Reply
    `;

    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');

    return button;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '[role="presentation"]', '.gmail_quote'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log('Toolbar not found');
        return;
    }

    console.log("Toolbar found, injecting AI button");
    const button = createAIButton();

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.style.pointerEvents = 'none';

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][contenteditable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.log('Compose box not found');
            }
        } catch (error) {
            console.error('Failed to generate reply', error);
        } finally {
            button.innerHTML = `
              <span class="material-icons" style="font-size:16px; margin-right:6px;">smart_toy</span>
              AI Reply
            `;
            button.style.pointerEvents = 'auto';
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElement = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElement) {
            console.log("Compose window detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

