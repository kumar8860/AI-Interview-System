import PyPDF2
import re

def extract_text_from_pdf(file_stream):
    """Reads a PDF file stream and returns the text."""
    try:
        pdf_reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + " "
        return text.strip()
    except Exception as e:
        return str(e)

def parse_resume(file_stream):
    """Main function to process the resume and extract data."""
    text = extract_text_from_pdf(file_stream)
    
    # MCA Project standard: Extract emails and phone numbers using Regex
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    # Basic skill keyword matching (You can expand this list)
    tech_skills = ['python', 'java', 'react', 'node', 'sql', 'machine learning', 'c++', 'javascript']
    found_skills = [skill for skill in tech_skills if skill in text.lower()]

    return {
        "status": "success",
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "skills": found_skills,
        "raw_text_length": len(text)
    }