pragma solidity ^0.4.12;

contract OrderedListManager {

  struct ListElement {
    uint extKey;
    uint value;
    uint next;
    uint prev;
  }

  mapping (uint => ListElement) list;

  /* key pointing to the first element of the list */
  uint firstKey;

  /* to the current key needed to create a new one */
  uint currentKey;

  /* constructor */
  function OrderedListManager ()
    public {
  }

  /* support functions to manipulate the list */
  function addElement(
    ListElement element,
    uint atKey,
    bool toTheRight)
    private
  {
    /* the keys are a sequence, they also provides the length of the list
      WARING: keys dont provide the list order! */
    uint newKey = currentKey + 1;
    currentKey = newKey;

    /* check if this is the first element ever in the list`*/
    if (currentKey == 1) {
      /* the first element is the only element */
      firstKey = newKey;
      /* the element is added to the map */
      list[newKey] = element;
    } else {
      /* add the investment */
      list[newKey] = element;

      /* link with the rest of elements */
      if (toTheRight) {
        /* add the new element to the right of the atKey element */
        uint rightKey = list[atKey].next;

        /* update the links to the element at the left */
        list[newKey].prev = atKey;
        list[atKey].next = newKey;

        /* update the linkts of the next element at tthe right
           only if it exist */
        if (rightKey > 0) {
          list[newKey].next = rightKey;
          list[rightKey].prev = newKey;
        }

      } else {
        /* add the new element to the right of the atKey element */
        uint leftKey = list[atKey].prev;

        /* update the links to the element at the right */
        list[newKey].next = atKey;
        list[atKey].prev = newKey;

        /* update the linkts of the next element at the left
           only if it exist */
        if (leftKey > 0) {
          list[newKey].prev = leftKey;
          list[leftKey].next = newKey;
        } else {
          /* this element becomes the element at the top left of the list and is
           therefore the first element */
          firstKey = newKey;
        }
      }
    }
  }

  function addElementOrdered(
    ListElement element,
    uint atKey)
    public
  {
    uint nextKey = list[atKey].next;
    uint prevKey = list[atKey].prev;

    if (currentKey > 0) {
      if (atKey > 0) {

        /* check if the new element value is larger than that of the element in which
           it is requested to be inserted */
        if (list[atKey].value < element.value) {
          /* check if there is an element to the right */
          if (nextKey > 0) {
            /* check if new element value is larger than the element at the right */
            if (element.value > list[nextKey].value) {
              /* if so, keep looking to the right by calling this function again */
              /*  WARNING: recursive, unpredictable and unbounded gas consumption */
              addElementOrdered(element, nextKey);
              return;
            }
          }

          /* if not, you can safey add this element to the right */
          addElement(element, atKey, true);
          return;

        } else {
          /* the new element value is actually smaller */

          /* check if there is an element to the left */
          if (prevKey > 0) {
            /* check if new element value is lower than the element at the left */
            if (element.value < list[prevKey].value) {
              /* if so, keep looking to the left by calling this function again */
              addElementOrdered(element, prevKey);
            }
          }

          /* if not, you can safey add this element to the left */
          addElement(element, atKey, false);
          return;
        }
      } else {
        /* no atKey provided, start from the beginning
          WARNING: recursive, unpredictable and unbounded gas consumption */
        addElementOrdered(element, firstKey);
      }
    } else {
      /* first element */
      addElement(element, 0, true);
    }
  }

}
