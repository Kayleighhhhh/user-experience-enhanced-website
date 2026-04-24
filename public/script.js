// const uitleenForm = document.querySelector(".uit-form")
// const uitleenBtn = uitleenForm.querySelector("button")

// const inneemForm = document.querySelector(".in-form")
// const inneemBtn = inneemForm.querySelector("button")

// uitleenForm.addEventListener("submit", async function(event) {

//     event.preventDefault()

//     uitleenBtn.classList.add("loading")
//     uitleenBtn.textContent = "laden..."

//     let formData = new FormData(uitleenForm);

//     const response = await fetch(uitleenForm.action, {
//         method: uitleenForm.method,
//         body: new URLSearchParams(formData)
//     })

//     const responseData = await response.text()

//     const parser = new DOMParser()
//     const responseDOM = parser.parseFromString(responseData, 'text/html')

//     // const newState = responseDOM.querySelector

//     console.log("Loading state weghalen")
//     uitleenBtn.classList.remove("loading")
//     uitleenBtn.textContent = "✅ De status is aangepast!"
// })

// inneemForm.addEventListener("submit", async function(event) {

//     event.preventDefault()

//     inneemBtn.classList.add("loading")
//     inneemBtn.textContent = "laden..."

//     let formData = new FormData(inneemForm);

//     const response = await fetch(inneemForm.action, {
//         method: inneemForm.method,
//         body: new URLSearchParams(formData)
//     })

//     const responseData = await response.text()

//     const parser = new DOMParser()
//     const responseDOM = parser.parseFromString(responseData, 'text/html')

//     // const newState = responseDOM.querySelector

//     console.log("Loading state weghalen")
//     inneemBtn.classList.remove("loading")
//     inneemBtn.textContent = "✅ De status is aangepast!"
// })