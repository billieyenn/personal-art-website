/* eslint-enable */
/* eslint-disable */


// Function to find the point closest to a target point
let names = new Array(
  "Lorem",
  "Ipsum",
  );
let currentNameIndex = 0
const getNextName = () => {
  if(currentNameIndex >= names.length) {
    return ""
  }
  let name = names[currentNameIndex]
  currentNameIndex += 1
  return name
}

export { 
  getNextName
}
