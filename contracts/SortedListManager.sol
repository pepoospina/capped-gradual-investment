pragma solidity ^0.4.8;

library SortedListManager {

  struct ListElement {
    uint extKey;
    uint value;
    uint next;
    uint prev;
  }

  struct SortedList {
    mapping (uint => ListElement) list;
    uint firstKey;
    uint lastKey;
    uint currentKey;
    uint size;
  }

  /* support functions to manipulate the list */

  /* adds element at the end of the list */
  function push (
    SortedList storage self,
    ListElement element)
    internal
  {
    add(self, element, self.lastKey, true);
  }

  function popFirst (
    SortedList storage self)
    internal
  {
    if (self.size > 0) {
      /* set next as new first */
      uint next = self.list[self.firstKey].next;
      if (next > 0) {
        self.list[next].prev = 0;
        self.firstKey = next;
      }

      self.size--;
    }
  }

  /* adds element in any place of the list */
  function add(
    SortedList storage self,
    ListElement element,
    uint atKey,
    bool toTheRight)
    internal
  {
    /* the keys are a sequence, they also provides the length of the list
      WARING: keys dont provide the list order! */
    uint newKey = self.currentKey + 1;
    self.currentKey = newKey;

    /* check if this is the first element ever in the list`*/
    if (self.size == 0) {
      /* the first element is the only element */
      self.firstKey = newKey;
      self.lastKey = newKey;

      /* the element is added to the map */
      self.list[newKey] = element;
      self.size++;

    } else {
      /* add the investment */
      self.list[newKey] = element;
      self.size++;

      /* link with the rest of elements */
      if (toTheRight) {
        /* add the new element to the right of the atKey element */
        uint rightKey = self.list[atKey].next;

        /* update the links to the element at the left */
        self.list[newKey].prev = atKey;
        self.list[atKey].next = newKey;

        /* update the links of the next element at the right
           only if it exist */
        if (rightKey > 0) {
          self.list[newKey].next = rightKey;
          self.list[rightKey].prev = newKey;
        } else {
          /* this is the last element */
          self.lastKey = newKey;
        }

      } else {
        /* add the new element to the left of the atKey element */
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

  /* adds element in the corresponing sorted position */
  function addSorted(
    SortedList storage self,
    ListElement element,
    uint atKey)
    internal
  {
    uint nextKey = self.list[atKey].next;
    uint prevKey = self.list[atKey].prev;

    if (self.currentKey > 0) {
      if (atKey > 0) {

        /* check if the new element value is larger than that of the element in which
           it is requested to be inserted */
        if (self.list[atKey].value <= element.value) {
          /* check if there is an element to the right */
          if (nextKey > 0) {
            /* check if new element value is larger than the element at the right */
            if (element.value >= self.list[nextKey].value) {
              /* if so, keep looking to the right by calling this function again */
              /*  WARNING: recursive, unpredictable and unbounded gas consumption */
              addSorted(self, element, nextKey);
              return;
            }
          }

          /* if not, you can safey add this element to the right */
          add(self, element, atKey, true);
          return;

        } else {
          /* the new element value is actually smaller */

          /* check if there is an element to the left */
          if (prevKey > 0) {
            /* check if new element value is lower than the element at the left */
            if (element.value < self.list[prevKey].value) {
              /* if so, keep looking to the left by calling this function again */
              addSorted(self, element, prevKey);
            }
          }

          /* if not, you can safey add this element to the left */
          add(self, element, atKey, false);
          return;
        }
      } else {
        /* no atKey provided, start from the beginning
          WARNING: recursive, unpredictable and unbounded gas consumption */
        addSorted(self, element, self.firstKey);
      }
    } else {
      /* first element */
      add(self, element, 0, true);
    }
  }

  function getFirst (SortedList storage self)
    internal
    constant
    returns (ListElement element)
  {
    return get(self, self.firstKey);
  }

  function getLast (SortedList storage self)
    internal
    constant
    returns (ListElement element)
  {
    return get(self, self.lastKey);
  }

  function get (SortedList storage self, uint key)
    internal
    constant
    returns (ListElement element)
  {
    return self.list[key];
  }

  function getSize (SortedList storage self)
    internal
    constant
    returns (uint size)
  {
    return self.size;
  }

}
