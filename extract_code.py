import os

# Исключаем эти папки на самом верхнем уровне
EXCLUDE_TOP_DIRS = {'.git', 'Ferid Profile', 'books'}

# Внутри проектов игнорируем папки с картинками
EXCLUDE_SUB_DIRS = {'assets'}

# Какие расширения файлов собирать
INCLUDE_EXTENSIONS = {'.html', '.js', '.css', '.py', '.json', '.md'}

# Получаем список всех папок в текущей директории
projects = [d for d in os.listdir('.') if os.path.isdir(d) and d not in EXCLUDE_TOP_DIRS]

for project in projects:
    output_filename = f"{project}_code.txt"
    print(f"Сборка кода для: {project} -> {output_filename}")
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # Обходим файлы только внутри конкретной папки проекта
        for root, dirs, files in os.walk(project):
            # Исключаем медиа-папки на лету
            dirs[:] = [d for d in dirs if d not in EXCLUDE_SUB_DIRS]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in INCLUDE_EXTENSIONS:
                    file_path = os.path.join(root, file)
                    
                    try:
                        outfile.write("=========================================\n")
                        # Записываем путь относительно папки проекта
                        outfile.write(f"FILE: {os.path.relpath(file_path, project)}\n")
                        outfile.write("=========================================\n")
                        
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                        outfile.write("\n\n")
                    except Exception as e:
                        outfile.write(f"[Ошибка чтения файла {file_path}: {e}]\n\n")

print("Готово! Все проекты сохранены в отдельные файлы.")