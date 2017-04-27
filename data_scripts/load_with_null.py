import sys
import requests

load_me = sys.argv[1]
with open(load_me, 'r') as f:
    process = f.readlines()
    for i in range(len(process)):
        if i > 0:
            line = process[i].split(',')
            worker = line[1][1:-1]
            task_id = -1
            token = -1
            comment = -1
            diagram_time = -1
            image_time = -1
            diagram_views = -1
            image_views = -1
            constraints = -1
            sub_region = -1
            data = {
                u'worker': worker,
                u'task': task_id,
                u'hash_token': token,
                u'comments': comment,
            }
            r = requests.post("https://groundtruth-study3.herokuapp.com/load_archive_task/", data=data)
            print(r.text)