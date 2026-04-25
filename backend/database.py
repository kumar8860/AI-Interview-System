import sqlite3

def init_db():
    conn = sqlite3.connect("interview.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        answer TEXT,
        emotion TEXT,
        score REAL
    )
    """)

    conn.commit()
    conn.close()


def insert_data(question, answer, emotion, score):
    conn = sqlite3.connect("interview.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO interviews (question, answer, emotion, score)
    VALUES (?, ?, ?, ?)
    """, (question, answer, emotion, score))

    conn.commit()
    conn.close()


def get_all_data():
    conn = sqlite3.connect("interview.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM interviews")
    rows = cursor.fetchall()

    conn.close()
    return rows