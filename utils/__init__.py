import datetime
from random import random
from pymongo.collection import Collection


RANDOMBASE = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
              'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
              'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd',
              'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
              'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
              'y', 'z']

INITIAL_TIME = datetime.datetime(2021, 6, 20)
LOGIN_EXP = 10
TIME_FORMAT = '%Y-%m-%d %H:%M:%S.%f'


QQ_CLIENT_ID = 101978697
QQ_CLIENT_SECRET = '2247193aa54fa286182734a1863bdc63' # key
QQ_REDIRECT_URI = 'https://sakuyark.com/login/qq'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
}

def is_mobile(request):
    UserAgent = request.headers.get("User-Agent")
    for i in ['iPhone', 'iPod', 'Android', 'ios', 'iPad']:
        if i in UserAgent:
            return True
    return False



def create_kv_pairs(
    collection: Collection,
    value: str,
    survival_time: datetime.timedelta
) -> str:
    key = ''.join(random.sample(RANDOMBASE, 24))
    while not collection.find_one({'key': key}) == None:
        key = ''.join(random.sample(RANDOMBASE, 24))
    collection.insert_one({
        'key': key,
        'value': value,
        'deadline': datetime.datetime.now() + survival_time
    })
    return key


def get_kv_pairs(
    collection: Collection,
    key: str,
    delete: bool = True
) -> str:
    data = collection.find_one({'key': key})
    if data is None:
        return None
    dead = data['deadline'] < datetime.datetime.now()
    if delete or dead:
        collection.delete_one({'_id', data['_id']})
    if dead:
        return None
    return data['value']