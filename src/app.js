App = {
    loading: false,
    contracts: {},

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async() => {

        if (typeof web3 !== 'undefined') {
            console.log(web3.currentProvider)
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                    // Acccounts now exposed
                web3.eth.sendTransaction({ /* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }

        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
                // Acccounts always exposed
            web3.eth.sendTransaction({ /* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async() => {
        // Set the current blockchain account
        App.account = web3.eth.accounts[0]
        console.log(App.account)
    },

    loadContract: async() => {
        // Create a JavaScript version of the smart contract
        const degreeVer = await $.getJSON('DegreeVerification.json')
        App.contracts.degreeVer = TruffleContract(degreeVer)
        App.contracts.degreeVer.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.degreeVer = await App.contracts.degreeVer.deployed()
    },

    render: async() => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    renderTasks: async() => {
        // Load the total task count from the blockchain
        const degreeCount = await App.degreeVer.NextDegreeId()
        const $taskTemplate = $('.taskTemplate')

        // Render out each task with a new task template
        for (var i = 0; i <= degreeCount - 1; i++) {
            // Fetch the task data from the blockchain
            const task = await App.degreeVer.DegreeDataList(i)

            console.log(task)

            const degreeId = task[0].toNumber()
            const taskContent = task[0] + " ," + task[1] + " ," + task[2] + " ," + task[3]

            console.log(taskContent)
                // const taskCompleted = task[2]

            // Create the html for the task
            const $degreeTemplate = $taskTemplate.clone()
            $degreeTemplate.find('.content').html(taskContent)
                // $degreeTemplate.find('input')
                // .prop('name', taskId)
                // .prop('checked', taskCompleted)
                // .on('click', App.toggleCompleted)

            // Put the task in the correct list
            // if (taskCompleted) {
            //     $('#completedTaskList').append($newTaskTemplate)
            // } else {
            $('#taskList').append($degreeTemplate)
                // }

            // Show the task
            $degreeTemplate.show()
        }
    },

    createDegree: async() => {
        App.setLoading(true)

        const studentId = $('#studentId').val()
        const studentName = $('#studentName').val()
        const degreeName = $('#degreeName').val()
        const university = $('#university').val()

        await App.degreeVer.CreateDegree(degreeName, university, studentId)
        window.location.reload()
    },

    verifyDegree: async() => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.degreeVer.createTask(content)
        window.location.reload()
    },

    // Login Section
    login: async() => {
        App.setLoading(true)

        const loginUserName = $('#login-form-email').val()
        const loginUserPass = $('#login-form-password').val()

        // await App.degreeVer.Login(loginUserName, loginUserPass)
        window.location.reload()
    },

    // Sign Up Section
    signup: async() => {
        App.setLoading(true)

        const signupUserName = $('#login-form-email').val()
        const signupUserPass = $('#login-form-password').val()
        const signupFullName = $('#login-form-fullname').val()
        const signupAccountType = $('#login-form-password').val()

        await App.degreeVer.SignupStakeholder(signupUserName, signupUserPass, signupFullName, signupAccountType);
        alert(await App.degreeVer.SignUpState());

        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})