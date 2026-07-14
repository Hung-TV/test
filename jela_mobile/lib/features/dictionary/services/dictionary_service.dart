import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/dictionary_detail.dart';
import '../models/dictionary_history.dart';
import '../models/dictionary_search_item.dart';

class DictionaryService {
  final ApiClient _apiClient = ApiClient();

  Future<List<DictionarySearchItem>> search(String searchKey) async {
    final response = await _apiClient.get(
      '${ApiConstants.dictionarySearch}?searchKey=${Uri.encodeQueryComponent(searchKey)}',
      requireAuth: true,
    );

    // Backend may return direct list or wrapped in { "data": [...] }
    List<dynamic> listData;
    if (response is List) {
      listData = response;
    } else if (response is Map && response['data'] is List) {
      listData = response['data'] as List;
    } else {
      listData = [];
    }

    return listData
        .map(
          (json) => DictionarySearchItem.fromJson(
            Map<String, dynamic>.from(json as Map),
          ),
        )
        .toList();
  }

  Future<DictionaryDetail> getDetail(int id) async {
    final response = await _apiClient.get(
      ApiConstants.dictionaryDetail(id),
      requireAuth: true,
    );

    // Backend may return direct object or wrapped in { "data": {...} }
    Map<String, dynamic> jsonMap;
    if (response is Map) {
      if (response['data'] is Map) {
        jsonMap = Map<String, dynamic>.from(response['data'] as Map);
      } else {
        jsonMap = Map<String, dynamic>.from(response);
      }
    } else {
      throw Exception('Dữ liệu chi tiết từ điển không đúng định dạng');
    }

    return DictionaryDetail.fromJson(jsonMap);
  }

  Future<List<HistoryWord>> getHistory({int page = 1}) async {
    final response = await _apiClient.get(
      '${ApiConstants.dictionaryHistory}?page=$page',
      requireAuth: true,
    );

    // Backend trả trực tiếp DictionaryHistoryResponse; vẫn giữ nhánh data để tương thích nếu API bọc response sau này.
    Map<String, dynamic> jsonMap;
    if (response is Map) {
      if (response['data'] is Map) {
        jsonMap = Map<String, dynamic>.from(response['data'] as Map);
      } else {
        jsonMap = Map<String, dynamic>.from(response);
      }
    } else {
      throw Exception('Dữ liệu lịch sử từ điển không đúng định dạng');
    }

    final historyResponse = DictionaryHistory.fromJson(jsonMap);
    return historyResponse.history;
  }
}
