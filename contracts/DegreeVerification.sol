pragma solidity ^0.5.0;

contract DegreeVerification
{
    uint public NextDegreeId;
    
    struct DegreeData
    {
        uint SerialNumber;
        string NationalIdentityCard;
        string StudentName;
        string StudentId;
        string DegreeTitle;
        string UniversityName;
        string DegreeJSON;
        bytes32 DegreeHash;
        address InsertedBy;
        // Status 
    }
    
    mapping(uint => DegreeData) public DegreeDataList;
    
    // Function Used to Insert data to blockchain
    function CreateDegree(string memory _nationIdCard, string memory _studentName, string memory _studentId, string memory _degreeTitle, string memory _universityName, string memory _degreeJSON) public returns (uint)
    {
        bytes32 _degreeHash = GetEthDegreeHash(_degreeTitle, _universityName, _degreeJSON);
        DegreeDataList[NextDegreeId] = DegreeData(NextDegreeId, _nationIdCard, _studentName, _studentId, _degreeTitle, _universityName, _degreeJSON, _degreeHash, msg.sender);

        NextDegreeId++;
        return NextDegreeId - 1;
    }

    // Function to Generate QR-Code
    function GetDegreeInfo(string memory _nationIdCard, string memory _degreeTitle, string memory _university) view public returns (bytes32, uint)
    {
        for(uint i= 0; i < NextStakeholderId; i++)
        {
            if(keccak256(abi.encodePacked((DegreeDataList[i].NationalIdentityCard))) == keccak256(abi.encodePacked((_nationIdCard))) 
            && keccak256(abi.encodePacked((DegreeDataList[i].DegreeTitle))) == keccak256(abi.encodePacked((_degreeTitle))) 
            && keccak256(abi.encodePacked((DegreeDataList[i].UniversityName))) == keccak256(abi.encodePacked((_university))))
            {
               return(DegreeDataList[i].DegreeHash, DegreeDataList[i].SerialNumber);
            }
        }
    }

    // Function to Generate QR-Code
    function GetDegreeInfo(uint _degreeId) view public returns(uint, string memory, string memory, string memory, string memory, string memory, bytes32)
    {
        return(
            DegreeDataList[_degreeId].SerialNumber,
            DegreeDataList[_degreeId].NationalIdentityCard,
            DegreeDataList[_degreeId].StudentName,
            DegreeDataList[_degreeId].StudentId,
            DegreeDataList[_degreeId].DegreeTitle, 
            DegreeDataList[_degreeId].UniversityName,
            DegreeDataList[_degreeId].DegreeHash
            ); 
    }

    // Function Used to Verify Degree 
    function VerifyDegree(uint _degreeId, bytes32 _degreeRequestedHash) view public returns (uint, string memory, string memory, string memory, string memory, address)
    {
        bytes32 _degreeComputedHash = GetEthDegreeHash(DegreeDataList[_degreeId].DegreeTitle, DegreeDataList[_degreeId].UniversityName, DegreeDataList[_degreeId].DegreeJSON);

        if(_degreeComputedHash == _degreeRequestedHash)
        {
            return (DegreeDataList[_degreeId].SerialNumber, DegreeDataList[_degreeId].NationalIdentityCard, DegreeDataList[_degreeId].StudentName, DegreeDataList[_degreeId].StudentId, DegreeDataList[_degreeId].DegreeTitle, DegreeDataList[_degreeId].InsertedBy);
        }
    }

    /*
    // User Registration and Login
    */
    uint public NextStakeholderId;
    string public SignUpStateMessage;
    
    struct Stakeholder
    {
        uint UniqueId;
        string Username;
        string UserPass;
        string FullName;
        address UserAddress;
        bytes32 StakeholderHash;
        string AccountType;
    }
    
    mapping(uint => Stakeholder) public StakeholderList;

    function SignupStakeholder(string memory _username, address _userAddress, string memory _password, string memory _fullName, string memory _accountType) public returns (uint)
    {
        address senderAddress = msg.sender;
        address adminAddress = 0xa1D1edb18C71a5E193F09366203f5EfD23EBBe8d;

        if(senderAddress == adminAddress)
        {
            bytes32 _stakeHolderHash = GetEthDegreeHash(_username, _password, _password);

            StakeholderList[NextStakeholderId] = Stakeholder(NextStakeholderId, _username, _password, _fullName, _userAddress, _stakeHolderHash, _accountType);
            NextStakeholderId++;
            SignUpStateMessage = "Successfully Signup, Permission Granted";
            return NextStakeholderId - 1;
        }
        SignUpStateMessage = "Not Allowed to Signup, Permission Denied";
        return 0;
    }
    
    // Function Used to Sign In dApp
    function SignInStakeholder(string memory _usermame, string memory _password) view public returns(string memory)
    {
        address senderAddress = msg.sender;
        for(uint i= 0; i < NextStakeholderId; i++)
        {
            if(keccak256(abi.encodePacked((StakeholderList[i].Username))) == keccak256(abi.encodePacked((_usermame))) &&  keccak256(abi.encodePacked((StakeholderList[i].UserPass))) == keccak256(abi.encodePacked((_password))))
            {
                bytes32 _stakeHolderHash = GetEthDegreeHash(_usermame, _password, _password);
                // (StakeholderList[i].StakeholderHash == _stakeHolderHash && StakeholderList[i].UserAddress ==  senderAddress)
                if(StakeholderList[i].StakeholderHash == _stakeHolderHash && StakeholderList[i].UserAddress ==  senderAddress)
                {
                    return _usermame;
                }
            }
        }
        return "";
    }

    /*    
    // Create and Verifying Hash
    */    
    
    function GetEthDegreeHash(string memory _degreeName, string memory _universityName, string memory _degreeJSON) public pure returns (bytes32)
    {
        bytes32 messageHash = GetMessageHash(_degreeName, _universityName, _degreeJSON);
        bytes32 ethSignMessageHash = GetEthMessageSignedHash(messageHash);
        
        return ethSignMessageHash;
    }
    
    function GetMessageHash(string memory _degreeName, string memory _universityName, string memory _degreeJSON) public pure returns (bytes32)
    {
        // have to add uniqueId in parameter to distinguish hash
        return keccak256(abi.encodePacked(_degreeName, _universityName, _degreeJSON));
    }
    
    function GetEthMessageSignedHash(bytes32 _messageHash) public pure returns (bytes32)
    {
        // prefix Ethereum signing message (32 bit) 
        // followed by length of message it required for ecrecover function
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
}