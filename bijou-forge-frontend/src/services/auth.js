export const login = async (email, password) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          user: { email },
          token: 'mock-token' 
        });
      }, 1000);
    });
  };
  
  export const signup = async (email, password) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          user: { email },
          token: 'mock-token' 
        });
      }, 1000);
    });
  };
  
  export const logout = async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };