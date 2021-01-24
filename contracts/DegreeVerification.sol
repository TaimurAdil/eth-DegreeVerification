pragma solidity ^0.5.0;

contract DegreeVerification
{
    uint public NextDegreeId;
    
    struct DegreeData
    {
        uint UniqueId;
        string DegreeName;
        string UniversityName;
        string DegreeJSON;
        bytes32 DegreeHash;
    }
    
    mapping(uint => DegreeData) public DegreeDataList;
    
    function CreateDegree(string memory _degreeName, string memory _universityName, string memory _degreeJSON) public returns (uint)
    {
        bytes32 _degreeHash = GetEthDegreeHash(_degreeName, _universityName, _degreeJSON);
        DegreeDataList[NextDegreeId] = DegreeData(NextDegreeId, _degreeName, _universityName, _degreeJSON, _degreeHash);
        NextDegreeId++;
        return NextDegreeId - 1;
    }
    
    function VerifyDegree(uint uniqueId) view public returns(string memory, string memory)
    {
        return(DegreeDataList[uniqueId].DegreeName, DegreeDataList[uniqueId].UniversityName); 
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

    function SignupStakeholder(string memory _usermame, string memory _password, string memory _fullName, string memory _accountType) public returns (uint)
    {
        address sender = msg.sender;
        address adminAddress = 0x99BC5c25Cd1750E386B9440C77b6e76b2b77C91A;

        if(sender == adminAddress)
        {
            bytes32 _stakeHolderHash = GetEthDegreeHash(_usermame, _password, _password);

            StakeholderList[NextStakeholderId] = Stakeholder(NextStakeholderId, _usermame, _password, _fullName, sender, _stakeHolderHash, _accountType);
            NextStakeholderId++;
            SignUpStateMessage = "Successfully Signup, Permission Granted";
            return NextStakeholderId - 1;
        }
        SignUpStateMessage = "Not Allowed to Signup, Permission Denied";
        return 0;
    }
    
    function SignInStakeholder(string memory _usermame, string memory _password) view public returns(string memory)
    {
        for(uint i= 0; i<NextStakeholderId; i++)
        {
            if(keccak256(abi.encodePacked((StakeholderList[i].Username))) == keccak256(abi.encodePacked((_usermame))) &&  keccak256(abi.encodePacked((StakeholderList[i].UserPass))) == keccak256(abi.encodePacked((_password))))
            {
                bytes32 _stakeHolderHash = GetEthDegreeHash(_usermame, _password, _password);

                if(StakeholderList[i].StakeholderHash == _stakeHolderHash)
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