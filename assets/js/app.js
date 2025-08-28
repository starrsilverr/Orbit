//Configuracion de Firebase
const firebaseConfig = {
     apiKey: "AIzaSyAMwjnXK9fziumz1C3ibGS3fPLZ235QqeQ",
  authDomain: "orbit-83c06.firebaseapp.com",
  projectId: "orbit-83c06",
  storageBucket: "orbit-83c06.firebasestorage.app",
  messagingSenderId: "325538309743",
  appId: "1:325538309743:web:32a5cb5cf068b60bec8f9a",
  measurementId: "G-KG6WS2Q4KX"
  };

  firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let displayName = null;
let currentUser = null; 
let photoURL = null;

const userModal = document.getElementById("user-modal");
const startChatBtn = document.getElementById("start-chat-btn");
const usernameInput = document.getElementById("username-input");
const avatarOptions = document.querySelectorAll(".avatar-option");

let selectedAvatar = null;

// Aqui vamos a ver si ya hay un usuario guardado en localStorage
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("chatUser");
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    displayName = userData.name;
    photoURL = userData.photo;
    currentUser = userData.uid;

    userModal.style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
    document.getElementById("send-btn").disabled = false;

    listenForMessages();
  }
});

// Aqui vamos vamos habilitar el boton de entrar al chat solo si hay datos previamente
function checkStartReady() {
  if (usernameInput.value.trim() !== "" && selectedAvatar) {
    startChatBtn.disabled = false;
  } else {
    startChatBtn.disabled = true;
  }
}

// Aqui vamos a detectar si se selecciono un avatar
avatarOptions.forEach(img => {
  img.addEventListener("click", () => {
    avatarOptions.forEach(i => i.classList.remove("selected"));
    img.classList.add("selected");
    selectedAvatar = img.src;
    checkStartReady();
  });
});

//Aqui detectamos si hay un cambio en el input , o el ingreso de un nombre 
usernameInput.addEventListener("input", checkStartReady);


// Aqui esta el evento click, que hara que funcione el boton de entrar al chat
startChatBtn.addEventListener("click", () => {
  displayName = usernameInput.value.trim();
  photoURL = selectedAvatar || "default-avatar.png";
  currentUser = 'user_' + Math.random().toString(36).substr(2, 9);

  // 🔹 Guardar en localStorage
  localStorage.setItem("chatUser", JSON.stringify({
    uid: currentUser,
    name: displayName,
    photo: photoURL
  }));

  userModal.style.display = "none";
  document.getElementById("chat-container").style.display = "flex";
  document.getElementById("send-btn").disabled = false;

  listenForMessages();
});


//Aqui se establece el boton enter del teclado para enviar mensajes
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("message-input").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// funcion para poder enviar los mensajes
function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();

  // Aqui vamos a evitar que se guarden mensajes vacios
  if (text === "") return;

  db.collection("mensajes").add({
    uid: currentUser,
    name: displayName,
    photo: photoURL || "default-avatar.png",
    text: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

// Aqui esta la funcion que muestra los mensajes / escucha, en tiempo real en pantalla
function listenForMessages() {
  db.collection("mensajes")
    .orderBy("createdAt")
    .onSnapshot(snapshot => {
      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = "";

      snapshot.forEach(doc => {
        const msg = doc.data();

        // 🔴 Evitar renderizar mensajes vacíos
        if (!msg.text || msg.text.trim() === "") return;

        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.classList.add(msg.uid === currentUser ? "mine" : "other");

        const img = document.createElement("img");
        img.src = msg.photo || "default-avatar.png";
        img.onerror = () => { 
          img.src = "default-avatar.png"; 
        };

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("message-content");

        const nameNode = document.createElement("div");
        nameNode.classList.add("message-name");
        nameNode.textContent = msg.name || "Anónimo";

        const textNode = document.createElement("div");
        textNode.textContent = msg.text;

        const timeNode = document.createElement("div");
        timeNode.classList.add("timestamp");
        if (msg.createdAt?.toDate) {
          const time = msg.createdAt.toDate();
          timeNode.textContent = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }

        contentDiv.appendChild(nameNode);
        contentDiv.appendChild(textNode);
        contentDiv.appendChild(timeNode);

        msgDiv.appendChild(img);
        msgDiv.appendChild(contentDiv);

        messagesDiv.appendChild(msgDiv);
      });

      //Aqui se hace el auto scroll hacia abajo
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
    
}

// Funcion para cerrar sesion / remover datos del usuario en el LocalStorage
function logoutUser() {
  localStorage.removeItem("chatUser");
  window.location.href = "inicio.html"; // Redirige a la página de inicio
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("chatUser");
      window.location.href = "inicio.html"; // Redirige al inicio
    });
  }

  const homeBtnLink = document.querySelector(".menu-btn a");
  if (homeBtnLink) {
    homeBtnLink.addEventListener("click", (e) => {
      // Si querés, podés prevenir el comportamiento por defecto
      // e.preventDefault();
      window.location.href = "index.html"; // Redirige a la página de inicio
    });
  }
});
