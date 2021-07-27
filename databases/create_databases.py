import pymongo,os
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
maindb.drop_collection('nav_item')
maindb.create_collection('nav_item')
maindb.nav_item.insert_many(
[
    {'title':'首页', 'href':'/', 'loca':10000},
    {'title':'公告', 'href':'/notice', 'loca':30000},
    {'title':'关于我们', 'href':'/about', 'loca':40000}
]
)

maindb.drop_collection('about')
maindb.create_collection('about')
maindb.about.insert_many(
[
    {'type':'text','content':
'''
# 我们是Sakuyark工作室
一群~~初中生~~**高中生**弄的工作室...~~名字奇奇怪怪~~

>这个网站还在制作阶段
>
>很大一部分页面还在制作

## 分站
[南雅中学C1818班](/c18)
'''}
]
)

maindb.drop_collection('links')
maindb.create_collection('links')
userdb.drop_collection('activate')
userdb.create_collection('activate')
# userdb.drop_collection('userdata')
# userdb.create_collection('userdata')
 
maindb.links.insert_many([
#     {'title':'爱知百科', 'href':'http://baike.aichistudio.space', 'loca':10000},
    {'title':'楠曦·拾柒的博客', 'href':'https://weibo.com/u/6974341736?is_all=1', 'loca':20000},
    {'title':'南雅·预备作家协会', 'href':'/PWA', 'loca':30000}
])
# userdb.create_collection('retrieve')
# userdb.userdata.update_many({'lvl':None},{'$set',{'lvl':0,'exp':0,'admin':0}})
userdb.drop_collection('lvldata')
userdb.create_collection('lvldata')
userdb.lvldata.insert_many([
    {'lvl':0, 'exp':1000},
    {'lvl':1, 'exp':2500},   {'lvl':2, 'exp':3750},
    {'lvl':3, 'exp':5625},   {'lvl':4, 'exp':8438},
    {'lvl':5, 'exp':12657},  {'lvl':6, 'exp':18986},
    {'lvl':7, 'exp':28479},  {'lvl':8, 'exp':42719},
    {'lvl':9, 'exp':64079},  {'lvl':10,'exp':96119},
    {'lvl':11,'exp':153790}, {'lvl':12,'exp':246064},
    {'lvl':13,'exp':393702}, {'lvl':14,'exp':639923},
    {'lvl':15,'exp':1007877},{'lvl':16,'exp':1612603},
    {'lvl':17,'exp':2902686},{'lvl':18,'exp':5805371},
])
# print(list(userdb.lvldata.find()))
# os.system('pause')
# print(list(userdb.userdata.find()))
# print(maindb.list_collection_names())
# print(userdb.list_collection_names())
# print(list(maindb.nav_item.find()))
# print(list(maindb.links.find()))