const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
  let template = link.import.querySelector('.task-template')
  if(template){
    let clone = document.importNode(template.content, true)
    document.querySelector('.content').appendChild(clone)
  }else{
    template = link.import.querySelector('.menu-template')
    if(template){
      let clone = document.importNode(template.content, true)
      document.querySelector('.app-menu-content').appendChild(clone)
    }
  }
})
