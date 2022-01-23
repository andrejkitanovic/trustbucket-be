module.exports = async (Object, queryParams) => {
  const response = await Object.find();
  return response;
};
