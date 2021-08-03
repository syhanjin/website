from __future__ import print_function
import requests
from requests.adapters import HTTPAdapter
import time
import os
from concurrent.futures import ThreadPoolExecutor, wait, ALL_COMPLETED, FIRST_COMPLETED
from bs4 import BeautifulSoup
import ctypes
import sys

# -- edition start --
edition = '1.4'
editionid = 5
# -- edition end --

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.3'
}

s = requests.Session()
s.mount('http://', HTTPAdapter(max_retries=5))
s.mount('https://', HTTPAdapter(max_retries=5))

hosts = []
ips = {}


def get_hosts():
    print('Download host-list.txt')
    try:
        s = requests.get('https://sakuyark.com/api/gaa/list', headers=headers)
        s.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('Get hosts failed.')
        exit()
    f = open('host-list.txt', 'wb')
    for chunk in s.iter_content(100000):
        f.write(chunk)
    print('Successfully downloaded host-list.txt')


def check_for_update():
    print('Check for update.')
    s = requests.get(
        'https://sakuyark.com/api/gaa/edid', headers=headers)
    s.encoding = 'utf-8'
    stamp = int(s.text)
    fn = os.path.basename(__file__)
    if editionid < stamp:
        print('Downloading GitHub-Access-Acceleration to', fn)
        if fn.split('.')[-1] == 'py':
            try:
                s = requests.get(
                    'https://sakuyark.com/api/gaa/py', headers=headers)
                s.raise_for_status()
            except requests.exceptions.RequestException as e:
                print('Get update failed.')
                exit()
            f = open(fn, 'wb')
            for chunk in s.iter_content(100000):
                f.write(chunk)
            print('Successfully downloaded', fn)
        if fn.split('.')[-1] == 'exe':
            try:
                s = requests.get(
                    'https://sakuyark.com/api/gaa/win', headers=headers)
                s.raise_for_status()
            except requests.exceptions.RequestException as e:
                print('Get update failed.')
                exit()
            f = open(fn, 'wb')
            for chunk in s.iter_content(100000):
                f.write(chunk)
            print('Successfully downloaded', fn)
        f.close()
        time.sleep(1.5)
        os.system('start '+fn)
        exit()


def check_list_update():
    if not os.path.exists('host-list.txt'):
        get_hosts()
        return
    s = requests.get(
        'https://sakuyark.com/api/gaa/list/timestamp', headers=headers)
    s.encoding = 'utf-8'
    stamp = float(s.text)
    if float(os.path.getmtime('host-list.txt')) < stamp:
        get_hosts()


def read_hosts():
    with open('host-list.txt', 'r') as f:
        for i in f.read().split('\n'):
            hosts.append(i)


def getIP(host):
    # print('Getting. url:','https://ip38.com/ip.php?ip='+host)
    try:
        s = requests.get('https://ip38.com/ip.php?ip='+host, headers=headers)
    except requests.exceptions.RequestException as e:
        print(host, 'ip acquisition failed.')
        return
    s.encoding = 'UTF-8'
    soup = BeautifulSoup(s.text, "html.parser")
    ip = soup.select('#c font font')[0].get_text()
    ips[host] = ip
    print('|',host.ljust(35, ' '),'|', ip.ljust(15, ' '),'|')


def main():
    print('Loaded.')
    print('Hosts: ')
    for i in hosts:
        print(i)
    print('-'*100)
    print('Multithreading preparing.')
    print('max_workers=10')
    executor = ThreadPoolExecutor(max_workers=10)
    time.sleep(2)
    print('-'*100)
    print('Get IP from \'https://ip38.com/\'.')
    print('-','HOST'.center(35, '-'),'|','IP'.center(15, '-'),'-')
    all_task = [executor.submit(getIP, (host)) for host in hosts]
    wait(all_task, return_when=ALL_COMPLETED)
    print('-','END'.center(53, '-'),'-')
    print('Writting to C:\\Windows\\System32\\drivers\\etc\\hosts')
    with open('C:\\Windows\\System32\\drivers\\etc\\hosts', 'w') as f:
        f.write('''
# Copyright (c) 2017-2020, googlehosts members.
# https://github.com/googlehosts/hosts
# Last updated: 2020-06-19

# This work is licensed under a modified HOSTS License.
# https://github.com/googlehosts/hosts/raw/master/LICENSE

# Modified Hosts Start

# Localhost (DO NOT REMOVE) Start
127.0.0.1	localhost
# Localhost (DO NOT REMOVE) End

# GitHub Start

''')
        for i in ips:
            f.write(ips[i]+' '+i+'\n')
        f.write('''
# GitHub End

# Modified Hosts End
        ''')
    print('Refreshing DNS cache.')
    os.system('ipconfig /flushdns')
    print('GitHub acceleration completed.')

    os.system('pause')


def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False


if __name__ == '__main__':
    if is_admin():
        check_for_update()
        check_list_update()
        read_hosts()
        main()
    else:
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, __file__, None, 1)
    # '''
