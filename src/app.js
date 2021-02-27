App = {
    loading: false,
    contracts: {},

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

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
        App.SetLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        // await App.renderTasks()
        await App.GenerateQR()

        // Update loading state
        App.SetLoading(false)

        var cookie = App.GetCookie("username");
        console.log('Cookie ' + cookie);
        if ((cookie == null || cookie == '') && window.location.pathname != '/login.html') {
            window.location.replace("/login.html");
        }
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

            // Create the html for the task
            const $degreeTemplate = $taskTemplate.clone()
            $degreeTemplate.find('.content').html(taskContent)
            $('#taskList').append($degreeTemplate)

            // Show the task
            $degreeTemplate.show()
        }
    },

    getAccount: async() => {
        App.account
    },

    LoginSignup: async() => {
        App.DeSetCookie();
        window.location.replace("/login.html");
    },

    createDegree: async() => {
        const studentCNIC = $('#studentCNIC').val()
        const studentId = $('#studentId').val()
        const studentName = $('#studentName').val()
        const degreeTitle = $('#degreeTitle').val()
        const universityName = $('#university').val()

        var degreeJson = {
            StudentCNIC: $('#studentCNIC').val(),
            StudentId: $('#studentId').val(),
            StudentName: $('#studentName').val(),
            DegreeTitle: $('#degreeTitle').val(),
            UniversityName: $('#university').val()
        };

        await App.degreeVer.CreateDegree(studentCNIC, studentName, studentId, degreeTitle, universityName, JSON.stringify(degreeJson));
        //alert('Degree Published on Chain Successfully...!!!');
        console.log('Degree Published on Chain Successfully...!!!')
        window.location.reload()
    },

    GenerateQR: async() => {
        const degreeCount = await App.degreeVer.NextDegreeId()
        const $taskTemplate = $('.taskTemplate')

        var QRContent = `<table class='table'>
        <thead class='thead-dark'>
          <tr>
            <th>Degree Id</th>
            <th>CNIC</th>
            <th>Student Id</th>
            <th>Student Name</th>
            <th>Degree Title</th>
            <th>QR</th>
            <th>QR Json</th>
          </tr>
        </thead>
        <tbody>`;

        for (var i = 0; i <= degreeCount - 1; i++) {
            const degreeData = await App.degreeVer.GetDegreeInfo(i)

            const degreeId = degreeData[0]
            const studentCNIC = degreeData[1]
            const studentName = degreeData[2]
            const studentId = degreeData[3]
            const degreeTitle = degreeData[4]
            const universityName = degreeData[5]
            const degreeHash = degreeData[6]

            var degreeJson = {
                DegreeId: degreeId,
                StudentCNIC: studentCNIC,
                Hash: degreeHash
            };

            QRContent += "<tr> <td>" + degreeId + "</td> <td>" + studentCNIC + "</td> <td>" + studentId + "</td> <td>" + studentName + "</td> <td>" + degreeTitle + "</td> <td> <img id='barcode' src='https://api.qrserver.com/v1/create-qr-code/?data=" + JSON.stringify(degreeJson) + "&amp;size=200x200'  alt=''  title='" + degreeHash + "' width='200'  height='200' /> </td> <td> <pre> " + JSON.stringify(degreeJson, undefined, 2) + " </pre> </td> </tr>";
        }

        QRContent += '</tbody> </table>';

        const $degreeTemplate = $taskTemplate.clone()
        $degreeTemplate.find('.content').html(QRContent)
        $('#taskList').append($degreeTemplate)

        $degreeTemplate.show()
    },

    VerifyDegree: async() => {
        //App.SetLoading(true)
        const degreeJson = $('#DegreeJSONtoVerify').val()
        const $taskTemplate = $('#verified-degree-list')

        try {
            JSON.parse(degreeJson)
        } catch (e) {
            var JsonNotValid = `<p> <center> <b>QR / JSON Not Valid</b> </center> </p>`;
            const $degreeTemplate = $taskTemplate.clone()
            $('#verified-degree-list').html(JsonNotValid)
            alert('QR / JSON Not Valid');
            return false;
        }

        var degreeObj = JSON.parse(degreeJson);
        const VerificationResult = await App.degreeVer.VerifyDegree(degreeObj.DegreeId, degreeObj.Hash)
        //alert(VerificationResult);

        var DegreeVerifiedContent = `<table>
        <tr>
            <th>Degree Id</th>
            <th>CNIC</th>
            <th>Student Name</th>
            <th>Degree Title</th>
            <th>Signed By</th>
        </tr>
        <tr>
            <td>` + VerificationResult[0] + `</td>
            <td>` + VerificationResult[1] + `</td>
            <td>` + VerificationResult[2] + `</td>
            <td>` + VerificationResult[4] + `</td>
            <td>` + VerificationResult[5] + `</td>
        </tr>
    </table>`;

        var DegreeNotVerifiedContent = `<p> <center> <b>No Data Found</b> </center> </p>`;

        const $degreeTemplate = $taskTemplate.clone()
        if (VerificationResult[1] != '' || VerificationResult[2] != '' || VerificationResult[4] != '') {
            $('#verified-degree-list').html(DegreeVerifiedContent)
        } else if (VerificationResult[1] == '') {
            $('#verified-degree-list').html(DegreeNotVerifiedContent)
            alert('No Data Found');
        }

        $degreeTemplate.show()
    },

    // Login Section
    login: async() => {
        App.SetLoading(true)

        const loginUserName = $('#login-form-email').val()
        const loginUserPass = $('#login-form-password').val()

        if (loginUserName == "" || loginUserPass == "") {
            window.location.reload()
        }

        const signedInResult = await App.degreeVer.SignInStakeholder(loginUserName, loginUserPass)
        alert(signedInResult)
        
        if (signedInResult == "") {
            window.location.reload()
        } else {
            if(signedInResult == 'hr@hr.com')
            {
                App.SetCookie("username", App.account, 30);
                window.location.replace("/index-corporate2.html");
            }
            else
            {
                App.SetCookie("username", App.account, 30);
                window.location.replace("/index-corporate.html");
            }
        }
    },

    // Sign Up Section
    signup: async() => {
        App.SetLoading(true)

        const signupUserName = $('#login-form-username').val()
        const signupUserAddress = $('#login-form-useraddress').val()
        const signupUserPass = $('#login-form-password').val()
        const signupFullName = $('#login-form-fullname').val()
        const signupAccountType = $('#login-form-password').val()

        await App.degreeVer.SignupStakeholder(signupUserName, signupUserAddress, signupUserPass, signupFullName, signupAccountType);
        alert(await App.degreeVer.SignUpStateMessage());

        window.location.reload()
    },

    SetLoading: (boolean) => {
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
    },

    //************************//
    // Cookies Helper Methods //
    //************************//
    SetCookie: (cname, cvalue, exdays) => {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    DeSetCookie: () => {
        document.cookie = null;
    },

    GetCookie: (cname) => {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    CheckCookie: () => {
        var user = App.GetCookie("username");
        if (user != "") {
            alert("Welcome again " + user);
        } else {
            user = prompt("Please enter your name:", "");
            if (user != "" && user != null) {
                App.SetCookie("username", user, 30);
            }
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})