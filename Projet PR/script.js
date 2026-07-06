/*
  script.js - Anniversaire Rose

  Role :
  - Gerer les messages du formulaire avec localStorage
  - Afficher les messages dans la page
  - Permettre la suppression d'un message
*/

(() => {
  "use strict";

  const STORAGE_KEY = "rose_guest_messages_v1";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Impossible de charger les messages :", error);
      return [];
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  function renderEmpty(container) {
    container.innerHTML = `
      <div class="empty-state" role="status">
        <div class="empty-heart" aria-hidden="true">&#127801;</div>
        <p>Le premier mot pour Rose sera le plus doux.</p>
      </div>
    `;
  }

  function renderMessageCard(message) {
    const id = escapeHtml(message.id);
    const name = escapeHtml(message.name);
    const text = escapeHtml(message.text);
    const dateLabel = escapeHtml(message.dateLabel || "maintenant");

    return `
      <article class="guest-card" data-id="${id}">
        <div class="guest-top">
          <div class="guest-avatar" aria-hidden="true">&#128151;</div>
          <div>
            <h3 class="guest-name">${name}</h3>
            <p class="guest-date">${dateLabel}</p>
          </div>
        </div>
        <p class="guest-text">${text}</p>
        <div class="guest-actions">
          <button class="guest-delete" type="button" data-id="${id}">
            Supprimer
          </button>
        </div>
      </article>
    `;
  }

  function renderAllMessages() {
    const list = document.getElementById("messagesList");
    if (!list) return;

    const messages = loadMessages();

    if (messages.length === 0) {
      renderEmpty(list);
      return;
    }

    list.innerHTML = messages
      .slice()
      .sort((a, b) => (b.date || 0) - (a.date || 0))
      .map(renderMessageCard)
      .join("");
  }

  function initGuestForm() {
    const form = document.getElementById("guestForm");
    const nameInput = document.getElementById("guestName");
    const textInput = document.getElementById("guestText");

    if (!form || !nameInput || !textInput) {
      return;
    }

    // Aide au debug (visible si localStorage est bloqué)
    const messagesList = document.getElementById("messagesList");
    const ensureStatusEl = () => {
      let el = document.getElementById("storageStatus");
      if (!el && messagesList) {
        el = document.createElement("div");
        el.id = "storageStatus";
        el.style.cssText = "margin-top:10px; font-weight:900; color: var(--muted);";
        messagesList.insertAdjacentElement('beforebegin', el);
      }
      return el;
    };

    const statusEl = ensureStatusEl();
    const canUseStorage = (() => {
      try {
        const key = "__bb_test__";
        localStorage.setItem(key, "1");
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })();

    if (statusEl) {
      statusEl.textContent = canUseStorage
        ? ""
        : "localStorage est bloqué dans ce navigateur/ce mode : les messages ne seront pas sauvegardés.";
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      const now = Date.now();
      if (statusEl && !canUseStorage) {
        statusEl.textContent = "Impossible d'enregistrer : localStorage est bloqué.";
        return;
      }

      const messages = loadMessages();

      messages.push({
        id: `${now}_${Math.random().toString(16).slice(2)}`,
        name,
        text,
        date: now,
        dateLabel: new Date(now).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      });

      saveMessages(messages);
      form.reset();
      renderAllMessages();

      form.classList.add("sent");
      window.setTimeout(() => form.classList.remove("sent"), 450);
    });

    document.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".guest-delete");
      if (!deleteButton) return;

      const id = deleteButton.dataset.id;
      if (!id) return;

      const messages = loadMessages();
      const nextMessages = messages.filter((message) => String(message.id) !== String(id));

      saveMessages(nextMessages);
      renderAllMessages();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAllMessages();
    initGuestForm();
  });
})();
