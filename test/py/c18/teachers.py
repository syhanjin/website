import pymongo, os
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
c18db = client['c18']
# c18db.drop_collection('teachers')
# c18db.create_collection('teachers')
# c18db.teachers.insert_many([
# {'name':'符进',  'id':'Mr.Fu',   'subject':'英语'},
# {'name':'虞年娥','id':'Mrs.Yu',   'subject':'数学'},
# {'name':'颜勤',  'id':'Miss.Yan','subject':'语文'},
# {'name':'曹霞娥','id':'Mrs.Cao',  'subject':'物理'},
# {'name':'黄辉',  'id':'Mr.Huang','subject':'政治'},
# {'name':'谭蓉',  'id':'Mrs.Tan',  'subject':'历史'},
# {'name':'黄海燕','id':'Mrs.Huang','subject':'化学'},
# {'name':'颜晓曦','id':'Mrs.Yan',  'subject':'语文'},
# {'name':'戴超',  'id':'Mr.Dai',  'subject':'地理'},
# {'name':'曹慧',  'id':'Mrs.Cao',  'subject':'生物'},
# {'name':'李彧',  'id':'Miss.Li', 'subject':'美术'},
# {'name':'毛祖朝','id':'Mr.Mao',  'subject':'音乐'},
# ])
teas=[
{'name':'符进',  'id':'Mr.Fu',   'subject':'英语'},
{'name':'虞年娥','id':'Mrs.Yu',   'subject':'数学'},
{'name':'颜勤',  'id':'Miss.Yan','subject':'语文'},
{'name':'曹霞娥','id':'Mrs.Cao',  'subject':'物理'},
{'name':'黄辉',  'id':'Mr.Huang','subject':'政治'},
{'name':'谭蓉',  'id':'Mrs.Tan',  'subject':'历史'},
{'name':'黄海燕','id':'Mrs.Huang','subject':'化学'},
{'name':'颜晓曦','id':'Mrs.Yan',  'subject':'语文'},
{'name':'戴超',  'id':'Mr.Dai',  'subject':'地理'},
{'name':'曹慧',  'id':'Mrs.Cao',  'subject':'生物'},
{'name':'李彧',  'id':'Miss.Li', 'subject':'美术'},
{'name':'毛祖朝','id':'Mr.Mao',  'subject':'音乐'},
]
for i in datas:
    c18db.teachers.update_one({'id':i['id']},{'$set':i})
