function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function (React) {
  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250,
        domViewport: window,
        continueManually: false
      };
    },
    componentDidMount: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    componentDidUpdate: function () {
      if (!this.props.continueManually) {
        this.attachScrollListener();
      }
    },
    render: function () {
      var props = this.props;
      if (this.props.direction === 'top') {
        return React.DOM.div(
          null,
          props.hasMore && (props.loader || InfiniteScroll._defaultLoader),
          props.children
        );
      } else {
        return React.DOM.div(null, props.children, props.hasMore && (props.loader || InfiniteScroll._defaultLoader));
      }
    },
    scrollListener: function () {
      var el = this.getDOMNode();
      var scrollTop;
      if(this.props.domViewport === window) {
        scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      } else {
        scrollTop = this.props.domViewport.scrollTop;
      }

      var position;
      if (this.props.direction === 'top') {
        position = scrollTop <= Number(this.props.threshold);
      } else {
        position = topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < Number(this.props.threshold);
      }

      if (position) {
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.pageLoaded += 1);
      }
    },
    attachScrollListener: function () {
      if (!this.props.hasMore) {
        return;
      }
      this.props.domViewport.addEventListener('scroll', this.scrollListener);
      this.props.domViewport.addEventListener('resize', this.scrollListener);
      this.scrollListener();
    },
    detachScrollListener: function () {
      this.props.domViewport.removeEventListener('scroll', this.scrollListener);
      this.props.domViewport.removeEventListener('resize', this.scrollListener);
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};
