// Simple test script to call the setup API
fetch("http://localhost:3000/api/setup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Setup API response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
