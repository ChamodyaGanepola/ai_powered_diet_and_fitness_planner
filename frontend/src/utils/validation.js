export const validateEmail = (email) => {
  const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9]{3,}$/;
  return re.test(username);
};
