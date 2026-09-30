/*
  script.js - Anniversaire Rose

  Role :
  - Gerer les messages du formulaire avec Firebase Firestore
  - Afficher les messages pour tous les visiteurs
  - Permettre la suppression d'un message
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZNPrgMDXd0aXagNMWmkLPva0UU-_CUo4",
  authDomain: "cadeau-commentaire.firebaseapp.com",
  projectId: "cadeau-commentaire",
  storageBucket: "cadeau-commentaire.firebasestorage.app",
  messagingSenderId: "981812501621",
  appId: "1:981812501621:web:2b427921653a9877cdec3c",
  measurementId: "G-MNJQKHLBGB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "maintenant";

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
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
  const dateLabel = escapeHtml(formatDate(message.createdAt));

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

function setStatus(text, isError = false) {
  const statusEl = document.getElementById("storageStatus");
  if (!statusEl) return;

  statusEl.textContent = text;
  statusEl.style.color = isError ? "#9f1239" : "var(--muted)";
}

function initStatus() {
  const messagesList = document.getElementById("messagesList");
  if (!messagesList || document.getElementById("storageStatus")) return;

  const el = document.createElement("div");
  el.id = "storageStatus";
  el.style.cssText = "margin-top:10px; font-weight:900; color: var(--muted);";
  messagesList.insertAdjacentElement("beforebegin", el);
}

function initPhotoCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const windowEl = carousel.querySelector("[data-carousel-window]");
    const track = carousel.querySelector("[data-carousel-track]");
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    if (!windowEl || !track || !prevButton || !nextButton) return;

    let position = 0;
    let pointerStart = null;

    const maximum = () => Math.max(0, track.scrollWidth - windowEl.clientWidth);
    const update = (animate = true) => {
      position = Math.min(Math.max(position, 0), maximum());
      track.style.transition = animate ? "" : "none";
      track.style.transform = `translateX(${-position}px)`;
      prevButton.disabled = position <= 1;
      nextButton.disabled = position >= maximum() - 1;
    };
    const step = () => {
      const firstSlide = track.querySelector(".photo-slide");
      if (!firstSlide) return windowEl.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
      return firstSlide.getBoundingClientRect().width + gap;
    };

    prevButton.addEventListener("click", () => { position -= step(); update(); });
    nextButton.addEventListener("click", () => { position += step(); update(); });

    windowEl.addEventListener("pointerdown", (event) => {
      pointerStart = { x: event.clientX, position };
      windowEl.setPointerCapture(event.pointerId);
      windowEl.classList.add("is-dragging");
      update(false);
    });
    windowEl.addEventListener("pointermove", (event) => {
      if (!pointerStart) return;
      position = pointerStart.position - (event.clientX - pointerStart.x);
      update(false);
    });
    const finishDrag = (event) => {
      if (!pointerStart) return;
      const moved = pointerStart.position - position;
      if (Math.abs(moved) > 30) position = pointerStart.position + (moved > 0 ? step() : -step());
      pointerStart = null;
      windowEl.classList.remove("is-dragging");
      update();
      if (windowEl.hasPointerCapture(event.pointerId)) windowEl.releasePointerCapture(event.pointerId);
    };
    windowEl.addEventListener("pointerup", finishDrag);
    windowEl.addEventListener("pointercancel", finishDrag);
    window.addEventListener("resize", () => update(false));
    update(false);
  });
}

function listenMessages() {
  const list = document.getElementById("messagesList");
  if (!list) return;

  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));

  onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...messageDoc.data()
      }));

      if (messages.length === 0) {
        renderEmpty(list);
        return;
      }

      list.innerHTML = messages.map(renderMessageCard).join("");
      setStatus("");
    },
    (error) => {
      console.error("Impossible de charger les messages :", error);
      setStatus("Impossible de charger les messages Firebase.", true);
    }
  );
}

function initGuestForm() {
  const form = document.getElementById("guestForm");
  const nameInput = document.getElementById("guestName");
  const textInput = document.getElementById("guestText");

  if (!form || !nameInput || !textInput) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    try {
      await addDoc(messagesRef, {
        name,
        text,
        createdAt: serverTimestamp()
      });

      form.reset();
      form.classList.add("sent");
      window.setTimeout(() => form.classList.remove("sent"), 450);
    } catch (error) {
      console.error("Impossible d'enregistrer le message :", error);
      setStatus("Impossible d'enregistrer le message Firebase.", true);
    }
  });

  document.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".guest-delete");
    if (!deleteButton) return;

    const id = deleteButton.dataset.id;
    if (!id) return;

    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (error) {
      console.error("Impossible de supprimer le message :", error);
      setStatus("Impossible de supprimer le message Firebase.", true);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initStatus();
  initPhotoCarousels();
  listenMessages();
  initGuestForm();
});
