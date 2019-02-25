const settings = require('electron-settings')

$('.app-chats-list').on('click','li',function(event){
    handleSectionTriggerShow(event.delegateTarget)
});

$('.app-interview-user-list').on('click','li',function(event){
    $(this).parents('#interview-list').find('.active').removeClass('active');
    $(this).addClass('active');
    handleSectionTriggerShow(document.getElementById('interview-list'));
    $('.app-interview-box').removeClass('is-hidden');
    $('.app-interview-score-box').addClass('is-hidden');
});

//i标签点击
function handleSectionTriggerShow(event) {
  hideAllSectionsAndDeselectButtons()

  // Highlight clicked button and show view
  //event.classList.add('is-selected')
    
  // Display the current section
  const sectionId = `${event.dataset.section}-section`
  document.getElementById(sectionId).classList.add('is-shown')

  // Save currently active button in localStorage
  const buttonId = event.getAttribute('id')
  settings.set('activeSectionButtonId', buttonId)
}

function activateDefaultSection () {
  document.getElementById('chat-button').click()
}

function showMainContent () {
  //document.querySelector('.js-nav').classList.add('is-shown')
  document.querySelector('.js-content').classList.add('is-shown')
}

function handleModalTrigger (event) {
  hideAllModals()
  const modalId = `${event.target.dataset.modal}-modal`
  document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown')
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove('is-shown')
  })
  showMainContent()
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.app-section.is-shown')
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.remove('is-shown')
  })

  // const buttons = document.querySelectorAll('.nav-button.is-selected')
  // Array.prototype.forEach.call(buttons, (button) => {
  //   button.classList.remove('is-selected')
  // })
}

function hideAllSectionsAndDeselectList () {
  const ul = document.querySelectorAll('.is-show')
  Array.prototype.forEach.call(ul, (ul) => {
    ul.classList.remove('is-show');
    ul.classList.add('is-hidden');
  })

  const buttons = document.querySelectorAll('.nav-button.is-selected')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected')
  })
}

function displayAbout () {
  document.querySelector('#app-chat-section').classList.add('is-shown')
}

// Default to the view that was active the last time the app was open
const sectionId = settings.get('activeSectionButtonId');
if (sectionId) {
  showMainContent()
  const section = document.getElementById(sectionId)
  if (section) section.click()
} else {
  activateDefaultSection()
  displayAbout()
}
