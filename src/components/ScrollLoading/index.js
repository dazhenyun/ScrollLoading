import React, { useEffect, useState, useImperativeHandle } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { List, message, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './index.less';

const Page = (props) => {
  const { params, cRef, reqCodeKey = 'code', reqCodeValue = '200', reqDataKey = 'data', reqListKey = 'msgs', title = '文本列表', showHeader = true, currentPageKey = 'page', height = '100%', method = 'GET', url = '/api/marketing_planning/getMsgs' } = props
  const [list, setList] = useState([]);
  const [pageStart, setPageStart] = useState(params[currentPageKey] || 0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const formatData = (data) => Object.entries(data).map(([key, value]) => `${key}=${value}`).join('&')

  const init = (flag) => {
    setLoading(true);
    let pageNo = pageStart + 1;
    let l = list;
    let t = total;
    if (flag === 'refresh') {
      l = [];
      t = 0;
      pageNo = 1;
      setList([]);
      setTotal(0);
      setHasMore(true);
      setPageStart(0);
    }
    if (l.length && l.length >= t) {
      message.warning('数据已全部加载完成');
      setHasMore(false);
      setLoading(false);
      return;
    }
    const myParams = {
      ...params,
      [currentPageKey]: pageNo,
    };

    let myUrl = url
    const m = method.toLocaleUpperCase()
    if (m === 'GET') {
      myUrl = `${myUrl}?${formatData(myParams)}`
    }
    let postParams = null
    if (m === 'POST') {
      postParams = { method: 'POST', body: JSON.stringify(myParams) }
    }
    fetch(myUrl, postParams).then(res => res.json()).then(res => {
      if (res[reqCodeKey] === reqCodeValue && res[reqDataKey]) {
        const r = l.concat(res[reqDataKey][reqListKey]);
        setList(r);
        setPageStart(pageNo);
        setTotal(res[reqDataKey][reqTotalKey]);
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  const loadMore = () => {
    if (loading) {
      return
    }
    init()
  }

  const refresh = () => {
    init('refresh')
  }

  useImperativeHandle(cRef, () => ({
    changeVal: () => {
      if (loading) {
        return
      }
      refresh()
    }
  }))

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="msg-list" style={{ height }}>
      {showHeader && <div className="msg-list-header">
        <span>{title}（{total}）</span>
        <ReloadOutlined className="reload-msg-list" title="刷新" onClick={refresh} />
      </div>}
      <div className="msg-list-main" style={{height: `calc(100% - ${showHeader ? 58 : 0}px)`}}>
        <InfiniteScroll
          className="list-scroll-wrap"
          initialLoad={false}
          pageStart={pageStart}
          loadMore={loadMore}
          hasMore={!loading && hasMore}
          useWindow={false}
        >
          <List dataSource={list}
            renderItem={(item, i) => (
              <List.Item title={item} key={i}>
                {item}
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
      {loading && hasMore && (
        <div className="loading-msg">
          <Spin />
        </div>
      )}
    </div>
  );
};

Page.propTypes = {
  params: PropTypes.object,
  cRef: PropTypes.object,
  title: PropTypes.string,
  showHeader: PropTypes.bool,
  currentPageKey: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  method: PropTypes.string,
  url: PropTypes.string,
  reqCodeKey: PropTypes.string,
  reqCodeValue: PropTypes.string,
  reqListKey: PropTypes.string,
  reqDataKey: PropTypes.string,
  reqTotalKey: PropTypes.string
}

export default Page;
