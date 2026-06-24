package org.dromara.yy.domain.vo;

import java.io.Serial;
import java.io.Serializable;

/**
 * 影约云首页概况视图对象
 */
public class YyDashboardOverviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long storeTotal;
    private Long businessStoreTotal;
    private Long orderTotal;
    private Long pendingOrderTotal;
    private Long arrivedOrderTotal;
    private Long completedOrderTotal;
    private Long albumTotal;
    private Long selectedAssetTotal;
    private Long channelPluginTotal;
    private Long unopenedChannelPluginTotal;

    public Long getStoreTotal() {
        return storeTotal;
    }

    public void setStoreTotal(Long storeTotal) {
        this.storeTotal = storeTotal;
    }

    public Long getBusinessStoreTotal() {
        return businessStoreTotal;
    }

    public void setBusinessStoreTotal(Long businessStoreTotal) {
        this.businessStoreTotal = businessStoreTotal;
    }

    public Long getOrderTotal() {
        return orderTotal;
    }

    public void setOrderTotal(Long orderTotal) {
        this.orderTotal = orderTotal;
    }

    public Long getPendingOrderTotal() {
        return pendingOrderTotal;
    }

    public void setPendingOrderTotal(Long pendingOrderTotal) {
        this.pendingOrderTotal = pendingOrderTotal;
    }

    public Long getArrivedOrderTotal() {
        return arrivedOrderTotal;
    }

    public void setArrivedOrderTotal(Long arrivedOrderTotal) {
        this.arrivedOrderTotal = arrivedOrderTotal;
    }

    public Long getCompletedOrderTotal() {
        return completedOrderTotal;
    }

    public void setCompletedOrderTotal(Long completedOrderTotal) {
        this.completedOrderTotal = completedOrderTotal;
    }

    public Long getAlbumTotal() {
        return albumTotal;
    }

    public void setAlbumTotal(Long albumTotal) {
        this.albumTotal = albumTotal;
    }

    public Long getSelectedAssetTotal() {
        return selectedAssetTotal;
    }

    public void setSelectedAssetTotal(Long selectedAssetTotal) {
        this.selectedAssetTotal = selectedAssetTotal;
    }

    public Long getChannelPluginTotal() {
        return channelPluginTotal;
    }

    public void setChannelPluginTotal(Long channelPluginTotal) {
        this.channelPluginTotal = channelPluginTotal;
    }

    public Long getUnopenedChannelPluginTotal() {
        return unopenedChannelPluginTotal;
    }

    public void setUnopenedChannelPluginTotal(Long unopenedChannelPluginTotal) {
        this.unopenedChannelPluginTotal = unopenedChannelPluginTotal;
    }
}
