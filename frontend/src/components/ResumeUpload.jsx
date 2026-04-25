export default function ResumeUpload({ setResume }) {

  const handleFile = (e) => {
    const file = e.target.files[0];
    setResume(file);
  };

  return (
    <input type="file" onChange={handleFile} />
  );
}