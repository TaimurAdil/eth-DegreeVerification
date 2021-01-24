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
    
    struct Stakeholder
    {
        uint UniqueId;
        string Username;
        string FullName;
        string StakeholderType;
        bytes32 StakeholderHash;
        //string accessType;
    }
    
    mapping(uint => Stakeholder) public StakeholderList;
    
    function SignupStakeholder(string memory _degreeName, string memory _universityName, string memory _degreeJSON) public returns (uint)
    {
        bytes32 _degreeHash = GetEthDegreeHash(_degreeName, _universityName, _degreeJSON);
        StakeholderList[NextStakeholderId] = Stakeholder(NextStakeholderId, _degreeName, _universityName, _degreeJSON, _degreeHash);
        NextStakeholderId++;
        return NextStakeholderId - 1;
    }
    
    function SignInStakeholder(uint uniqueId) view public returns(string memory, bytes32)
    {
        return(StakeholderList[uniqueId].Username, StakeholderList[uniqueId].StakeholderHash); 
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