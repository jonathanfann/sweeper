import requests
import os

working_directory = os.getcwd()
version_file_path = f'{working_directory}/version.txt'
html_file_path = f'{working_directory}/index.html'
html_generated_path = f'{working_directory}/index-generated.html'
js_file_path = f'{working_directory}/game.js'
css_file_path = f'{working_directory}/styles.css'

def update_html():
    try:
        version_file = open(version_file_path, 'r')
        version = version_file.read()
        major_minor_version = version.rpartition('.')[0]
        sub_minor_version = version.rpartition('.')[-1]
        version_int = int(sub_minor_version)
        version_int += 1
        new_version = f'{major_minor_version}.{str(version_int)}'
        print(f'new_version: {new_version}')
    except:
        print("failed to get / set version")
    try:
        with open(version_file_path, 'w') as idFile:
            idFile.write(new_version)
        html_file = open(html_file_path, 'r')
        source_code = html_file.read()
        new_source_code = source_code.replace('{{VERSION}}', new_version)
        with open(html_generated_path, "w") as file:
            file.write(new_source_code)
    except:
        print("failed to update source code")
    

def upload_to_neocities():
    try:
        update_html()
        minesweeper_key = 'MINESWEEPER_KEY'
        api_key = os.getenv(minesweeper_key)
        fileData = {'index.html': open(html_generated_path,'rb'), 'game.js': open(js_file_path,'rb'), 'styles.css': open(css_file_path,'rb')}
        print(fileData)
        return requests.post("https://neocities.org/api/upload", files=fileData, headers={"Authorization":f"Bearer {api_key}"})
    except:
        print("failed to upload to neocities")

if __name__ == '__main__': 
    upload_to_neocities()