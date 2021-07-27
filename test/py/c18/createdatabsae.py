import pymongo,os
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
c18db = client['c18']
c18db.drop_collection('nav_item')
c18db.create_collection('nav_item')
c18db.nav_item.insert_many(
[
    {'title':'班级信息', 'href':'/c18', 'loca':10000},
    {'title':'老师信息', 'href':'/c18/teachers', 'loca':20000},
    {'title':'花名册', 'href':'/c18/roster', 'loca':30000},
    {'title':'下载app','href':'/static/c18/NY·C1818.apk', 'loca':40000},
    {'title':'说明','href':'/c18/d&h', 'loca':60000}
]
)
c18db.drop_collection('together')
c18db.create_collection('together')
c18db.together.insert_many(
[
    {'main':True,'src':'/static/c18/GP.jpg','loca':10000},
    {'main':True,'src':'/static/c18/cartoon.jpg','loca':20000},
    {'main':True,'src':'/static/c18/students.jpg','loca':30000},
    {'main':True,'src':'/static/c18/members.jpg','loca':40000},
    {'main':True,'src':'/static/c18/av.jpg','loca':50000}
]
)
