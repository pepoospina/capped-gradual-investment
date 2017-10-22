pragma solidity ^0.4.8;

library OrderedListManager {

  struct ListElement {
    uint extKey;
    uint value;
    uint next;
    uint prev;
  }

  struct OrderedList {
    mapping (uint => ListElement) list;
    uint firstKey;
    uint currentKey;
  }

  /* support functions to manipulate the list */
  function addElement(
    OrderedList storage self,
    ListElement storage element,
    uint atKey,
    bool toTheRight)
  {
    /* the keys are a sequence, they also provides the length of the list
      WARING: keys dont provide the list order! */
    uint newKey = self.currentKey + 1;
    self.currentKey = newKey;

    /* check if this is the first element ever in the list`*/
    if (self.currentKey == 1) {
      /* the first element is the only element */
      self.firstKey = newKey;
      /* the element is added to the map */
      self.list[newKey] = element;
    } else {
      /* add the investment */
      self.list[newKey] = element;

      /* link with the rest of elements */
      if (toTheRight) {
        /* add the new element to the right of the atKey element */
        uint rightKey = self.list[atKey].next;

        /* update the links to the element at the left */
        self.list[newKey].prev = atKey;
        self.list[atKey].next = newKey;

        /* update the linkts of the next element at tthe right
           only if it exist */
        if (rightKey > 0) {
          self.list[newKey].next = rightKey;
          self.list[rightKey].prev = newKey;
        }

      } else {
        /* add the new element to the right of the atKey element */
        uint leftKey = self.list[atKey].prev;

        /* update the links to the element at the right */
        self.list[newKey].next = atKey;
        self.list[atKey].prev = newKey;

        /* update the linkts of the next element at the left
           only if it exist */
        if (leftKey > 0) {
          self.list[newKey].prev = leftKey;
          self.list[leftKey].next = newKey;
        } else {
          /* this element becomes the element at the top left of the list and is
           therefore the first element */
          self.firstKey = newKey;
        }
      }
    }
  }

  function addElementOrdered(
    OrderedList storage self,
    ListElement storage element,
    uint atKey)
  {
    uint nextKey = self.list[atKey].next;
    uint prevKey = self.list[atKey].prev;

    if (self.currentKey > 0) {
      if (atKey > 0) {

        /* check if the new element value is larger than that of the element in which
           it is requested to be inserted */
        if (self.list[atKey].value < element.value) {
          /* check if there is an element to the right */
          if (nextKey > 0) {
            /* check if new element value is larger than the element at the right */
            if (element.value > self.list[nextKey].value) {
              /* if so, keep looking to the right by calling this function again */
              /*  WARNING: recursive, unpredictable and unbounded gas consumption */
              addElementOrdered(self, element, nextKey);
              return;
            }
          }

          /* if not, you can safey add this element to the right */
          addElement(self, element, atKey, true);
          return;

        } else {
          /* the new element value is actually smaller */

          /* check if there is an element to the left */
          if (prevKey > 0) {
            /* check if new element value is lower than the element at the left */
            if (element.value < self.list[prevKey].value) {
              /* if so, keep looking to the left by calling this function again */
              addElementOrdered(self, element, prevKey);
            }
          }

          /* if not, you can safey add this element to the left */
          addElement(self, element, atKey, false);
          return;
        }
      } else {
        /* no atKey provided, start from the beginning
          WARNING: recursive, unpredictable and unbounded gas consumption */
        addElementOrdered(self, element, self.firstKey);
      }
    } else {
      /* first element */
      addElement(self, element, 0, true);
    }
  }

}
