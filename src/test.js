const parent = [1, 2, 3];
const [a, b, c] = parent; // destructuring the array
console.log(a, b, c);

// destructure the object, obj.
const obj = {
    name: "Sean",
    age: 20,
};

const { age } = obj;
console.log(`${obj.name} is ${age} years old.`);
