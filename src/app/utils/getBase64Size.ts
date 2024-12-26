export const getBase64Size = (base64String: Base64URLString) => {
  const base64WithoutPrefix = base64String.replace(/^data:.*?;base64,/, "");
  return Math.ceil((base64WithoutPrefix.length * 3) / 4);
};
