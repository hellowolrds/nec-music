import React, { Component} from 'react';
import * as api from '../../api'
import qs from 'query-string'
import {Spin} from 'antd'
import {Link} from 'react-router-dom'
import {pos} from '../../util/dom'
import { Pagination } from 'antd';

class Artist extends Component {
	constructor(props) {
		super(props);
		this.state = {
			artists:[],
			total:0,
			keywords:'',
			currPage:1,
			queryCorrected:null
		}
		this.choosePage = (page,pageSize) => {
			this.setState({
				currPage:page,
				artists:[]
			})
			const query = qs.parse(this.props.location.search)
			const keywords = query.keywords	
			api.search(keywords,100,page-1).then(res => {
				if(res.data.code == 200) {
					this.setState({
						artists:res.data.result.artists
					})
					const sp = pos(document.getElementById('search_result'))
					window.scrollTo.apply(null,sp)
				}
			})
		}
	}
	componentDidMount() {
		const keywords = qs.parse(this.props.location.search).keywords
		if(keywords === undefined) {
			return false
		}
		this.setState({
			keywords:keywords
		})
		api.search(keywords,100).then(res => {
			console.log(res)
			if(res.data.code == 200) {
				this.setState({
					artists:res.data.result.artists,
					total:res.data.result.artistCount,
					queryCorrected:res.data.result.queryCorrected
				})
			}
		})
	}
	componentWillReceiveProps(nextProps) {
		const keywords = qs.parse(nextProps.location.search).keywords
		if(keywords === undefined || keywords == this.state.keywords) {
			return false
		}
		this.setState({
			keywords:keywords,
			artists:[],
			total:0,
			currPage:1,
			queryCorrected:null
		})
		api.search(keywords,100).then(res => {
			console.log(res)
			if(res.data.code == 200) {
				this.setState({
					artists:res.data.result.artists,
					total:res.data.result.artistCount,
					queryCorrected:res.data.result.queryCorrected
				})
			}
		})
	}
	render() {
		const {artists,total,keywords,currPage,queryCorrected} = this.state
		return (
			<div className="ztag n-srchrst f-pr" id="search_result">
				<div className="snote s-fc4 ztag">
					搜索“{keywords}”，找到 <em className="s-fc6">{total}</em> 个歌手
					{queryCorrected?<span>，您是不是要搜：<Link className="s-fc7" to={`/search/artist?keywords=${queryCorrected}`}>{queryCorrected}</Link></span>:null}
				</div>
				<div className="m-sgerlist m-sgerlist-1">
					<ul className="m-cvrlst m-cvrlst-5 f-cb">
						{artists.length?artists.map((i,index) =>
							<li key={index}>
								<div className="u-cover u-cover-5">
									<Link to={`/artist?id=${i.id}`}>
										<img src={i.picUrl?`${i.picUrl}?param=130y130`:'/static/img/default-artist.jpg'} />
										<span title={i.name} className="msk"></span>
									</Link>
								</div>
								<p>
									<Link className="nm f-thide s-fc0" to={`/artist?id=${i.id}`} title={i.name} dangerouslySetInnerHTML={{__html:i.name.replace(new RegExp(keywords,'gi'),rs =>`<span class="s-fc7">${rs}</span>`)}}></Link>
									{i.accountId?<Link to={`/user/home?id=${i.accountId}`}><i className="u-icn u-icn-5"></i></Link>:null}
								</p>
							</li>
						):<div style={{height:'300px'}} className="loading"><Spin tip="Loading..." /></div>}
					</ul>
					<div className="u-page" style={{display:total<=30?'none':'block'}}>
						<Pagination onChange={this.choosePage} current={currPage}   pageSize={30} total={total} />
					</div>
				</div>
			</div>
			
		);
	}
}

export default Artist