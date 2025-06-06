from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Flask, render_template
import mysql.connector
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'casino'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Crear tablas si no existen
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dni VARCHAR(20) UNIQUE NOT NULL,
            nombres VARCHAR(100) NOT NULL,
            apellidos VARCHAR(100) NOT NULL,
            nacionalidad VARCHAR(50) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            email VARCHAR(100) NOT NULL,
            telefono VARCHAR (20),  
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()


@app.route('/')
def casino():
    return render_template('index.html')


# Rutas de la API
@app.route('/api/clientes', methods=['GET', 'POST'])
def gestion_clientes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute('SELECT * FROM clientes ORDER BY fecha_registro DESC')
        clientes = cursor.fetchall()
        
        # Convertir fecha a string para JSON
        for cliente in clientes:
            cliente['fecha_nacimiento'] = cliente['fecha_nacimiento'].isoformat()
            if 'fecha_registro' in cliente:
                cliente['fecha_registro'] = cliente['fecha_registro'].isoformat()
        
        cursor.close()
        conn.close()
        return jsonify(clientes)
    
    elif request.method == 'POST':
        data = request.get_json()
        
        # Validar datos
        required_fields = [ 'nombres', 'apellidos', 'dni', 'nacionalidad', 'fecha_nacimiento', 'email', 'telefono' ]
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        try:
            cursor.execute('''
                INSERT INTO clientes (dni, nombres, apellidos, nacionalidad, fecha_nacimiento, email, telefono)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                data['dni'],
                data['nombres'],
                data['apellidos'],
                data['nacionalidad'],
                data['fecha_nacimiento'],
                data['email'],
                data.get('telefono', '')  
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'Cliente registrado con éxito'}), 201
        except mysql.connector.IntegrityError as e:
            return jsonify({'error': 'El DNI ya está registrado'}), 400
        except Exception as e:
            conn.close()
            return jsonify({'error': str(e)}), 500

@app.route('/api/clientes/<dni>', methods=['GET', 'PUT', 'DELETE'])
def gestion_cliente(dni):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute('SELECT * FROM clientes WHERE dni = %s', (dni,))
        cliente = cursor.fetchone()
        
        if cliente:
            cliente['fecha_nacimiento'] = cliente['fecha_nacimiento'].isoformat()
            cursor.close()
            conn.close()
            return jsonify(cliente)
        else:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Cliente no encontrado'}), 404
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        try:
            cursor.execute('''
                UPDATE clientes 
                SET nombres = %s, apellidos = %s, nacionalidad = %s, 
                    fecha_nacimiento = %s, email = %s, telefono = %s
                WHERE dni = %s
            ''', (
                data['nombres'],
                data['apellidos'],
                data['nacionalidad'],
                data['fecha_nacimiento'],
                data['email'],
                data.get('telefono', ''),  # Nuevo campo
                dni
            ))
            
            if cursor.rowcount == 0:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Cliente no encontrado'}), 404
            
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'Cliente actualizado con éxito'})
        except Exception as e:
            conn.close()
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            cursor.execute('DELETE FROM clientes WHERE dni = %s', (dni,))
            
            if cursor.rowcount == 0:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Cliente no encontrado'}), 404
            
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'Cliente eliminado con éxito'})
        except Exception as e:
            conn.close()
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
