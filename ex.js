class MyObject {
    // Define class methods
    method1() {
        console.log('Hello from method1!');
    }
}

// Create an instance of MyObject
const myInstance = new MyObject();

// Save the instance to Redis
redisClient.set('myKey', JSON.stringify(myInstance));

// Retrieve the instance from Redis
redisClient.get('myKey', (err, result) => {
    if (err) {
        console.error(err);
    } else {
        // Deserialize the result into an object
        const deserializedObject = JSON.parse(result);

        // Invoke the method on the deserialized object
        deserializedObject.method1(); // Output: 'Hello from method1!'
    }
});
