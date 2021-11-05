'''
    # 通过账号
    # 通过key
    key = request.args.get('key')
    if key is None:
        return render_template('error/pc.html',error='权限不足')
    data = botdb.console.find_one({
        'key': key
    })
    if data is None or data['deadtime'] < datetime.datetime.now():
        botdb.kw_edit.delete_one({
            'key': key
        })
        return render_template('error/pc.html', error='权限不足')
'''