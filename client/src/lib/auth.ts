export async function getCurrentUser() {
  // Mocking for development:
  return {
    name: "John Doe",
    role: "user", // change to "mentor", "seller", "writer" to test different sidebars
  };
}