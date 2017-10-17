pragma solidity ^0.4.16;

contract OrderedListStructs {

  struct ListElement {
    uint extKey;
    uint value;
    uint next;
    uint prev;
  }

  struct OrderedList {
    /* key pointing to the first element of the list */
    uint firstKey;
    /* last key used */
    uint currentKey;
    /* elements container */
    mapping (uint => ListElement) public map;
  }

}
