import core from "@actions/core";

export const getBody = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    }
    throw new Error(`HTTP Error! Status: ${response.status}`);
  } catch (error) {
    core.error(`Error getting body: ${error}`);
  }
};
