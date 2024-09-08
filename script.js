

let transactions = [] // LISTA QUE GUARDA TODAS AS TRANSAÇÕES 

function createTransactionContainer(id){  // CRIA O CONTAINER DA TRANSAÇÃO COM O PARÂMETRO(ID) RETORNADO PELA API
    const container = document.createElement("div")
    container.classList.add('transaction')
    container.id = `transaction-${id}`
    return container
}


function createTransactionTitle(name){  // CRIA O TÍTULO DA TRANSAÇÃO
    const title = document.createElement("span")
    title.classList.add("transaction-title")
    title.textContent = name
    return title
}

function createTransactionAmount(amount){ // CRIA O VALOR DA TRANSAÇÃO
    const span = document.createElement("span")

    const formater = Intl.NumberFormat('pt-BR', { // FORMATADOR DE ESTILO DE TRANSAÇÃO PARA O REAL BRASILEIRO
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    })

    const formatedAmount = formater.format(amount) // FORMATA O VALOR DA TRANSAÇÃO

    if (amount > 0) {
        span.textContent = `${formatedAmount} C` // TRANSAÇÃO MAIOR QUE ZERO, CRÉDITO
        span.classList.add("transaction-amount","credit")
    } else{
        span.textContent = `${formatedAmount} D`
        span.classList.add("transaction-amount","debit") // TRANSAÇÃO MENOR QUE ZERO, DÉBITO
    }

    return span

}

function createEditTransactionBtn(transaction){  // CRIA O BOTÃO DE EDITAR DA TRANSAÇÃO
    const editBtn = document.createElement("button")
    editBtn.classList.add("edit-btn")
    editBtn.textContent = "Editar"
    editBtn.addEventListener("click", () => { // AO CLICAR NO BOTÃO, OS VALORES DOS INPUTS DO FORM SERÃO OS MESMOS DA TRANSAÇÃO EDITADA
        document.querySelector("#id").value = transaction.id 
        document.querySelector("#name").value = transaction.name
        document.querySelector("#amount").value = transaction.amount
    })

    return editBtn
}

function createDeleteTransactionBtn(id){ // CRIA O BOTÃO DE EXCLUIR TRANSAÇÃO
    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add('delete-btn')
    deleteBtn.textContent = "Excluir"
    deleteBtn.addEventListener("click", async () => {
        await fetch(`http://localhost:3000/transactions/${id}`, { method: 'DELETE' })  // CHAMA A API PASSANDO O MÉTODO DELETE
        deleteBtn.parentElement.remove() // REMOVE TAMBÉM O ELEMENTO PARENTE DO BOTÃO, OU SEJA, O CONTAINER DA TRANSAÇÃO
        const indexToRemove = transactions.findIndex((t) => t.id === id) // ENCONTRA A TRANSAÇÃO PELO ID, NO ARRAY DE TRANSAÇÕES
        transactions.splice(indexToRemove, 1) // QUANDO ENCONTRAR A TRANSAÇÃO PELO ID, REMOVE DO ARRAY
        updateBalance() 
    })
    return deleteBtn
}


function renderTransaction(transaction){ // RENDERIZA TODOS OS ELEMENTOS DA APLICAÇÃO
    const container = createTransactionContainer(transaction.id)
    const title = createTransactionTitle(transaction.name)
    const amount = createTransactionAmount(transaction.amount)
    const editBtn = createEditTransactionBtn(transaction)
    const deleteBtn = createDeleteTransactionBtn(transaction.id)

    container.append(title, amount, editBtn, deleteBtn)
    document.querySelector('#transactions').append(container)
}


async function fetchTransactions(){    // FAZ A CHAMADA DA API E CONVERTE PARA JSON
    return await fetch("http://localhost:3000/transactions").then(res => res.json()) 
}


async function saveTransaction(ev){  // FUNÇÃO QUE SALVA A TRANSAÇÃO
    ev.preventDefault() // PREVINE O COMPORTAMENTO PADRÃO



    const id = document.querySelector("#id").value
    const name = document.querySelector("#name").value
    const amount = parseFloat(document.querySelector("#amount").value)

    if (id) {
        // SE O ID EXISTIR, VAI APENAS EDITAR A TRANSAÇÃO
        const response = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, amount }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const transaction = await response.json()

        const indexToRemove = transactions.findIndex((t) => t.id === id) // VAI ACHAR A TRANSAÇÃO QUE ESTÁ SENDO EDITADA NO ARRAY DE TRANSAÇÕES
        transactions.splice(indexToRemove, 1, transaction) // REMOVE A TRANSAÇÃO ANTIGA DO ARRAY E INSERE A EDITADA
        document.querySelector(`#transaction-${id}`).remove() // REMOVE A TRANSAÇÃO ANTIGA NO HTML E INSERE A EDITADA
        renderTransaction(transaction) // RENDERIZA A NOVA TRANSAÇÃO EDITADA

    } else{ 
        // SE O ID NÃO EXISTIR, VAI CRIAR UMA TRANSAÇÃO
        const response = await fetch('http://localhost:3000/transactions', {
            method: "POST",
            body: JSON.stringify({ name, amount }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        const transaction = await response.json()
        transactions.push(transaction)
        renderTransaction(transaction)
    }
    
    ev.target.reset()
    updateBalance()
}



function updateBalance(){  // FUNÇÃO PARA ATUALIZAR O SALDO
    const balanceSpan = document.querySelector("#balance")
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0) // IRÁ RETORNAR O VALOR TOTAL DO SALDO
    const formater = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    })
    balanceSpan.textContent = formater.format(balance)
}


async function setup(){
    const results = await fetchTransactions()
    transactions.push(...results)
    transactions.forEach(renderTransaction)
    updateBalance()
}




document.addEventListener("DOMContentLoaded", setup)
document.querySelector('form').addEventListener("submit", saveTransaction)

