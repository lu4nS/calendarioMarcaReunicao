document.addEventListener("DOMContentLoaded", function () {
  const calendarElement = document.getElementById("calendar");
  const modal = document.getElementById("modal");
  const confirmationModal = document.getElementById("confirmation-modal");
  const modalClose = document.querySelector(".close");
  const selectedDateElement = document.getElementById("selected-date");
  const reservationDetails = document.getElementById("reservation-details");
  const timeSlotsContainer = document.getElementById("time-slots");
  const toggleAvailability = document.getElementById("toggle-availability");
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const copyUrlBtn = document.getElementById("copy-url-btn");
  const whatsappBtn = document.getElementById("whatsapp-btn");
  const saveBtn = document.getElementById("save-btn");

  let selectedDate = null;
  let availabilityData = {};
  let isUserAccess = false; // Novo indicador para saber se é um usuário acessando via URL

  // Função para criar o calendário
  function createCalendar() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.textContent = day;
      dayElement.addEventListener("click", () => openModal(day));
      calendarElement.appendChild(dayElement);
    }
  }

  // Função para abrir o modal e carregar horários
  function openModal(day) {
    selectedDate = day;
    selectedDateElement.textContent = `${day}/10/2024`; // Exemplo com mês fixo
    modal.style.display = "flex";

    // Carregar dados de disponibilidade para o dia, se existirem
    if (availabilityData[day]) {
      toggleAvailability.checked = availabilityData[day].available;
      startTimeInput.value = availabilityData[day].startTime;
      endTimeInput.value = availabilityData[day].endTime;
    } else {
      toggleAvailability.checked = false;
      startTimeInput.value = "09:00";
      endTimeInput.value = "17:00";
    }

    // Se o usuário acessou via URL, mostra o botão de Reservar
    if (isUserAccess) {
      saveBtn.textContent = "Reservar"; // Trocar o texto do botão para "Reservar"
      saveBtn.removeEventListener("click", saveAvailability); // Remove a função de salvar
      saveBtn.addEventListener("click", openConfirmationModal); // Adiciona a função de reservar
    } else {
      saveBtn.textContent = "Salvar Alterações"; // Mantém o botão de salvar
      saveBtn.removeEventListener("click", openConfirmationModal);
      saveBtn.addEventListener("click", saveAvailability);
    }
  }

  // Fechar o modal
  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Função para salvar alterações de disponibilidade
  function saveAvailability() {
    availabilityData[selectedDate] = {
      available: toggleAvailability.checked,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value,
    };
    console.log(
      `Horários salvos para o dia ${selectedDate}:`,
      availabilityData[selectedDate]
    );
    modal.style.display = "none";
  }

  // Função para abrir o modal de confirmação de reserva
  function openConfirmationModal() {
    modal.style.display = "none";
    confirmationModal.style.display = "flex";
    reservationDetails.textContent = `Você está reservando a data ${selectedDate}/10/2024, das ${startTimeInput.value} às ${endTimeInput.value}`;
  }

  // Fechar o modal de confirmação
  document
    .querySelector("#confirmation-modal .close")
    .addEventListener("click", () => {
      confirmationModal.style.display = "none";
    });

  // Função para enviar a reserva pelo WhatsApp
  whatsappBtn.addEventListener("click", () => {
    const message = `Estou reservando o dia ${selectedDate}/10/2024, das ${startTimeInput.value} às ${endTimeInput.value}.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });

  // Função para gerar a URL codificada
  function generateUrl() {
    const urlParams = new URLSearchParams();

    for (let day in availabilityData) {
      if (availabilityData[day].available) {
        urlParams.append(
          day,
          `${availabilityData[day].startTime}-${availabilityData[day].endTime}`
        );
      }
    }

    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}?${urlParams.toString()}`;
    return fullUrl;
  }

  // Função para copiar a URL para a área de transferência
  copyUrlBtn.addEventListener("click", () => {
    const url = generateUrl();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("URL copiada para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar a URL: ", err);
      });
  });

  // Função para ler e extrair os parâmetros da URL
  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);

    for (const [day, times] of params.entries()) {
      const [startTime, endTime] = times.split("-");
      availabilityData[day] = {
        available: true,
        startTime: startTime,
        endTime: endTime,
      };
    }

    if (params.toString()) {
      isUserAccess = true; // Marcar como acesso de usuário
    }

    console.log("Dados extraídos da URL:", availabilityData);
  }

  // Inicializar o calendário
  createCalendar();

  // Ler os parâmetros da URL, se houver
  if (window.location.search) {
    readUrlParams();
  }
});
