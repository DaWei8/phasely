export function showCustomModal(title: string, message: string): void {
  let modal = document.getElementById("customAlertModal");
  let modalMsg = document.getElementById("customAlertModalMsg");
  let modalTitle = document.getElementById("customAlertModalTitle");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "customAlertModal";
    modal.className = "fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 px-5";
    modal.innerHTML = `
      <div class="bg-white flex flex-col rounded-lg h-40 shadow-lg px-3 py-5 max-w-sm w-full">
        <div class="flex items-center justify-between mb-4">
          <div id="customAlertModalTitle" class="text-black text-xl font-bold text-center"></div>
          <button onclick="closeCustomModal()" class="text-gray-800 hover:text-gray-800 text-2xl font-bold">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div id="customAlertModalMsg" class="text-gray-800 text-lg text-center"></div>
      </div>`;
    document.body.appendChild(modal);
    modalMsg = document.getElementById("customAlertModalMsg");
    modalTitle = document.getElementById("customAlertModalTitle");
  }

  if (modalMsg) modalMsg.textContent = message;
  if (modalTitle) modalTitle.textContent = title;
  modal.classList.remove("hidden");
}