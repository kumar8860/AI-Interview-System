export const startInterview = async (answer) => {
  const res = await fetch("http://127.0.0.1:5000/interview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });

  return res.json();
};